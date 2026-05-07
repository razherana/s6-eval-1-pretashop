import { parse } from 'csv-parse/browser/esm';

export async function parseCSV(
  csv: string,
  separator: string,
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    parse(
      csv,
      {
        delimiter: separator,
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err: Error | null, records: Record<string, string>[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(records);
        }
      },
    );
  });
}
