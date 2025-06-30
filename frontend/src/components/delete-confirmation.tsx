type DeleteConfirmationProps = {
  title: string
  message: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmation({ title, message, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="flex gap-4 mt-4">
        <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirmer</button>
        <button onClick={onCancel} className="text-gray-600">Annuler</button>
      </div>
    </div>
  )
}
