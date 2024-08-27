import { Address, beginCell, Cell, Dictionary, BitBuilder, BitReader, Slice, Builder } from '@ton/core';
import { sha256 } from 'ton-crypto';

const OFF_CHAIN_CONTENT_PREFIX = 0x01;
const ON_CHAIN_CONTENT_PREFIX = 0x00;

function bufferToChunks(buff: Buffer, chunkSize: number) : Buffer[] {
	const chunks: Buffer[] = [];
	while (buff.byteLength > 0) {
		chunks.push(buff.slice(0, chunkSize));
		buff = buff.slice(chunkSize);
	}
	return chunks;
}

export function makeSnakeCell(data: Buffer) : Cell{
	const chunks = bufferToChunks(data, 127);
	const rootCell = beginCell();
	let curCell = rootCell;

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];

		curCell.storeBuffer(chunk);

		if (chunks[i + 1]) {
			const nextCell = beginCell();
			curCell.storeRef(nextCell);
			curCell = nextCell;
		}
	}

	return rootCell.endCell();
}

export function encodeOffChainContent(content: string) : Cell {
	let data = Buffer.from(content);
	const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
	data = Buffer.concat([offChainPrefix, data]);
	return makeSnakeCell(data);
}



const SNAKE_CELL_PREFIX: number = 0x00;

export function flattenSnakeCell(cell: Cell) {
    let c: Cell | null = cell;

    const bitResult = new BitBuilder();
    while (c) {
        const cs = c.beginParse();
        if (cs.remainingBits === 0) {
            break;
        }

        const data = cs.loadBits(cs.remainingBits);
        bitResult.writeBits(data);
        c = c.refs && c.refs[0];
    }

    const endBits = bitResult.build();
    const reader = new BitReader(endBits);

    return reader.loadBuffer(reader.remaining / 8);
}

export function ParseChunkDict(cell: Slice): Buffer {
    const dict = cell.loadDict(Dictionary.Keys.Uint(32), ChunkDictValueSerializer);

    let buf = Buffer.alloc(0);
    for (const [_, v] of dict) {
        buf = Buffer.concat([buf, v.content]);
    }
    return buf;
}

interface ChunkDictValue {
    content: Buffer;
}

interface MetadataDictValue {
    content: Buffer;
}

export const ChunkDictValueSerializer = {
    serialize(src: ChunkDictValue, builder: Builder) {},
    parse(src: Slice): ChunkDictValue {
        const snake = flattenSnakeCell(src.loadRef());
        return { content: snake };
    },
};

export const MetadataDictValueSerializer = {
    serialize(src: MetadataDictValue, builder: Builder) {
        const snakeCellPrefix = Buffer.from([SNAKE_CELL_PREFIX]);
        const data = Buffer.concat([snakeCellPrefix, src.content]);
        const cell = makeSnakeCell(data);
        builder.storeRef(cell);
    },
    parse(src: Slice): MetadataDictValue {
        const ref = src.loadRef().asSlice();

        const start = ref.loadUint(8);
        if (start === 0) {
            const snake = flattenSnakeCell(ref.asCell());
            return { content: snake };
        }

        if (start === 1) {
            return { content: ParseChunkDict(ref) };
        }

        return { content: Buffer.from([]) };
    },
};


export type OnchainContent = {
    image: string;
    name: string;
    description: string;
    symbol: string;
	decimals: string;
};

export async function encodeOnChainContent(content: OnchainContent): Promise<Cell> {
    const metadata: Record<string, { content: Buffer }> = {
        image: { content: Buffer.from(content.image) },
        name: { content: Buffer.from(content.name) },
        description: { content: Buffer.from(content.description) },
        symbol: { content: Buffer.from(content.symbol) },
		decimals: { content: Buffer.from(content.decimals) }
    };

    const metadataDict = await Object.entries(metadata).reduce(
        async (dict, [key, value]) => {
            const keyHash = await sha256(key);
            return (await dict).set(keyHash, value);
        },
        Promise.resolve(Dictionary.empty(Dictionary.Keys.Buffer(32), MetadataDictValueSerializer)),
    );

    return beginCell().storeUint(ON_CHAIN_CONTENT_PREFIX, 8).storeDict(metadataDict).endCell();
}