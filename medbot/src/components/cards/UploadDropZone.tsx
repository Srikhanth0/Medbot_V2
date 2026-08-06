import * as React from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export function UploadDropZone() {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-colors ${
        isDragging ? "border-white bg-[#6A7880]" : "border-gray-400 bg-[#7E8B91]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        // Handle file drop
      }}
    >
      <motion.div
        animate={{ y: isDragging ? -10 : 0 }}
        className="mb-4 rounded-full bg-white/20 p-4"
      >
        <UploadCloud className="h-8 w-8 text-white" />
      </motion.div>
      <p className="text-lg font-semibold text-white mb-2">Drag & Drop your files here</p>
      <p className="text-sm text-gray-200 mb-6">or click to browse</p>
      <button className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#11222C] shadow-sm hover:bg-gray-100 transition-colors">
        Select Files
      </button>

      {/* Mock Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden rounded-b-3xl h-2 bg-black/20">
        <div className="h-full bg-green-400 w-1/3" />
      </div>
    </div>
  );
}
