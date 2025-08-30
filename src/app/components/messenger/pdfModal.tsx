"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Download, FileText, Plus } from "lucide-react";
import { saveAs } from "file-saver";

export default function PdfModal({ fileUrl, fileName,}: { fileUrl: string; fileName: string;}) {
    const [open, setOpen] = useState(false);

    const handleDownload = async () => {
        if (fileUrl) {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        saveAs(blob, fileName || "download.pdf");
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
        <div className="bg-white w-[90%] h-[90%] rounded-xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
            <button
                onClick={handleDownload}
                className="cursor-pointer text-black font-bold"
            >
                <Download size={18} />
            </button>
            <h2 className="text-sm font-semibold text-black truncate max-w-[70%]">
                {fileName}
            </h2>
            <button
                onClick={() => setOpen(false)}
                className="text-red-500 font-bold text-lg rotate-45"
            >
                <Plus />
            </button>
            </div>

            <div className="w-full flex-1 overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={fileUrl} />
            </Worker>
            </div>
        </div>
        </div>
    );

    return (
        <>
        <button
            onClick={() => setOpen(true)}
            className="underline text-sm flex gap-2 items-center"
        >
            <FileText size={18} /> {fileName}
        </button>

        {open && createPortal(modalContent, document.body)}
        </>
    );
}
