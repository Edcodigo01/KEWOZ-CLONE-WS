import React, { useRef, useState } from 'react';
import { Button, Input } from '@/components/ui';

type AddGiftFormProps = {
  onSubmit?: (payload: {
    imageFile: File | null;
    giftName: string;
    category: string;
    coins: number | null;
  }) => void | Promise<void>;
};

export default function AddGiftForm({ onSubmit }: AddGiftFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [giftName, setGiftName] = useState('');
  const [category, setCategory] = useState('');
  const [coins, setCoins] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setImageFile(file);
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await onSubmit?.({ imageFile, giftName, category, coins: coins ? Number(coins) : null });
  };

  return (
    <form className="space-y-6 p-1" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Image <span className="text-red-500">*</span></label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={handleBrowse}
          className="group border-2 border-dashed rounded-lg h-40 flex items-center justify-center text-sm cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-gray-300"
        >
          {imageFile ? (
            <span className="text-gray-700">{imageFile.name}</span>
          ) : (
            <span className="text-gray-500">Drop your image here or click to browse</span>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Gift Name <span className="text-red-500">*</span></label>
          <Input
            value={giftName}
            onChange={(e) => setGiftName(e.target.value)}
            placeholder="Enter gift name"
            className="focus-visible:ring-yellow-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Gift Category <span className="text-red-500">*</span></label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
          >
            <option value="">Select categories</option>
            <option value="stickers">Stickers</option>
            <option value="premium">Premium</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Coins Values <span className="text-red-500">*</span></label>
        <Input
          type="number"
          min={0}
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
          placeholder="Enter coin value"
          className="focus-visible:ring-yellow-200"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-11 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}


