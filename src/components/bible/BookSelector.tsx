import type { BookMeta } from "@/types/bible";
import { isOldTestament } from "@/lib/bible/constants";

interface BookSelectorProps {
  books: BookMeta[];
  onSelect: (bookNumber: number) => void;
}

/**
 * 책 선택 UI.
 * 구약/신약으로 구분하여 책 목록 표시.
 */
export default function BookSelector({ books, onSelect }: BookSelectorProps) {
  const oldTestament = books.filter((b) => isOldTestament(b.book));
  const newTestament = books.filter((b) => !isOldTestament(b.book));

  return (
    <div className="space-y-8">
      {/* 구약 */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-500">
          Old Testament
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {oldTestament.map((book) => (
            <button
              key={book.book}
              onClick={() => onSelect(book.book)}
              className="rounded-lg border border-surface-200 px-3 py-2.5 text-left text-sm font-medium text-surface-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100"
            >
              <span className="block truncate">{book.name}</span>
              <span className="text-xs text-surface-400">{book.chapters}장</span>
            </button>
          ))}
        </div>
      </section>

      {/* 신약 */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-500">
          New Testament
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {newTestament.map((book) => (
            <button
              key={book.book}
              onClick={() => onSelect(book.book)}
              className="rounded-lg border border-surface-200 px-3 py-2.5 text-left text-sm font-medium text-surface-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100"
            >
              <span className="block truncate">{book.name}</span>
              <span className="text-xs text-surface-400">{book.chapters}장</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
