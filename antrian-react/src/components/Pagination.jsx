import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

export function usePagination(items = [], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedItems = items.slice(startIndex, endIndex)

  const resetPage = () => setCurrentPage(1)

  return {
    currentPage,
    setCurrentPage,
    resetPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    paginatedItems,
  }
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemName = 'data',
  className = '',
}) {
  if (!totalItems || totalItems === 0) return null

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const isMultiplePages = totalPages > 1

  return (
    <div className={`table-pagination ${className}`}>
      <div className="table-pagination__info">
        {isMultiplePages ? (
          <>
            Menampilkan <strong>{startIndex + 1}–{endIndex}</strong> dari{' '}
            <strong>{totalItems}</strong> {itemName}
          </>
        ) : (
          <>
            Menampilkan total <strong>{totalItems}</strong> {itemName}
          </>
        )}
      </div>

      {isMultiplePages && (
        <div
          className="table-pagination__controls"
          role="navigation"
          aria-label="Navigasi Halaman"
        >
          <button
            type="button"
            className="table-pagination__btn table-pagination__btn--icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Halaman Pertama"
            aria-label="Halaman Pertama"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="table-pagination__btn table-pagination__btn--nav"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
            <span className="table-pagination__btn-label">Sebelumnya</span>
          </button>

          <div className="table-pagination__pages">
            {getPageNumbers(currentPage, totalPages).map((p, idx) =>
              p === '...' ? (
                <span
                  key={`dots-${idx}`}
                  className="table-pagination__ellipsis"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`table-pagination__btn ${
                    currentPage === p ? 'is-active' : ''
                  }`}
                  onClick={() => onPageChange(p)}
                  aria-current={currentPage === p ? 'page' : undefined}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="table-pagination__btn table-pagination__btn--nav"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Halaman Selanjutnya"
            aria-label="Halaman Selanjutnya"
          >
            <span className="table-pagination__btn-label">Selanjutnya</span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="table-pagination__btn table-pagination__btn--icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Halaman Terakhir"
            aria-label="Halaman Terakhir"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
