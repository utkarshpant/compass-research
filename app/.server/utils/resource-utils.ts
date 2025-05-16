import { Readable } from 'stream';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Asynchronously reads data from a readable stream and concatenates it into a single Buffer.
 *
 * @param stream - The readable stream to read data from.
 * @returns A promise that resolves to a Buffer containing the concatenated data from the stream.
 */
async function getBufferFromStream(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(chunk as Buffer);
	}
	return Buffer.concat(chunks);
}

/**
 * Cleans up a given text string by normalizing line endings, removing excessive
 * blank lines, and trimming unnecessary whitespace.
 *
 * The function performs the following transformations:
 * - Replaces all occurrences of `\r\n` or `\r` with `\n` to normalize line endings.
 * - Collapses multiple consecutive blank lines into a single blank line.
 * - Removes trailing spaces or tabs at the end of each line.
 * - Trims leading and trailing whitespace from the entire string.
 *
 * @param txt - The input text string to be cleaned.
 * @returns The cleaned and normalized text string.
 */
function clean(txt: string) {
	return txt
		.replace(/\r\n|\r/g, '\n')
		.replace(/\n{2,}/g, '\n\n')
		.replace(/[ \t]+\n/g, '\n')
		.trim();
}

/**
 * Splits the text content of a PDF stream into smaller chunks with optional overlap.
 *
 * @param pdfStream - A readable stream of the PDF file to be processed.
 * @param chunkSize - The maximum size of each text chunk. Defaults to 1000 characters.
 * @param overlap - The number of overlapping characters between consecutive chunks. Defaults to 200 characters.
 * @returns A promise that resolves to an array of text chunks extracted from the PDF.
 *
 * @throws Will throw an error if the PDF stream cannot be processed or if the text extraction fails.
 */
export async function chunkPdf(
	pdfStream: Readable,
	chunkSize = 1000,
	overlap = 200
): Promise<string[]> {
	const buffer = await getBufferFromStream(pdfStream);
	const { text } = (await pdf(buffer)) as { text: string };
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize,
		chunkOverlap: overlap,
	});

	return splitter.splitText(clean(text));
}

/**
 * Extracts the first and last portions of text from a PDF stream.
 *
 * @param pdfStream - A readable stream of the PDF file.
 * @param take - The number of characters to extract from the start and end of the text. Defaults to 1500.
 * @returns A promise that resolves to an object containing the `first` and `last` portions of the text.
 *
 * @example
 * ```typescript
 * const pdfStream = fs.createReadStream('example.pdf');
 * const result = await extractFirstLast(pdfStream, 1000);
 * console.log(result.first); // First 1000 characters of the PDF text
 * console.log(result.last);  // Last 1000 characters of the PDF text
 * ```
 */
export async function extractFirstLast(
	pdfStream: Readable,
	take = 1500 // characters to grab from start/end
): Promise<{ first: string; last: string }> {
	const buffer = await getBufferFromStream(pdfStream);
	const { text } = (await pdf(buffer)) as { text: string };
	const cleaned = clean(text);

	return {
		first: cleaned.slice(0, take),
		last: cleaned.slice(-take),
	};
}
