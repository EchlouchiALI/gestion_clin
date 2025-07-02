"use client"

type DeleteConfirmationProps = {
  title: string
  message: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmation({ title, message, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="p-6 bg-white shadow-xl rounded-lg max-w-md w-full">
        <h2 className="font-bold text-lg text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Confirmer
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors duration-200"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
