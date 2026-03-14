const fs = require('fs');
let code = fs.readFileSync('src/components/image/ImageMode.tsx', 'utf8');

const stateOld = \  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);\;

const stateNew = \  const [files, setFiles] = useState<{ id: string; file: File; previewUrl: string; }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFileObj = files[activeIndex];
  const file = activeFileObj?.file || null;
  const previewUrl = activeFileObj?.previewUrl || null;\;

code = code.replace(stateOld, stateNew);

const inputOld = \  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      resetHook();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile && selectedFile.type.startsWith(\"image/\")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      resetHook();
    }
  };\;

const inputNew = \  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith(\"image/\"));
    if (validFiles.length === 0) return;
    
    const fileObjs = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f)
    }));
    
    setFiles(prev => {
      const next = [...prev, ...fileObjs];
      if (prev.length === 0) {
        setActiveIndex(0);
        resetHook();
      }
      return next;
    });
  }, [resetHook]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };\;

code = code.replace(inputOld, inputNew);

code = code.replace(
  'accept=\"image/*\"',
  'accept=\"image/*\" multiple'
);

const captureOld = \        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], \"screenshot.png\", { type: \"image/png\" });
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setFile(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            resetHook();
          }
        }, \"image/png\");\;

const captureNew = \        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], \"screenshot.png\", { type: \"image/png\" });
            handleFilesAdded([capturedFile]);
          }
        }, \"image/png\");\;

code = code.replace(captureOld, captureNew);

const pasteOld = \      for (const item of items) {
        if (item.type.startsWith(\"image/\")) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setFile(pastedFile);
            setPreviewUrl(URL.createObjectURL(pastedFile));
            resetHook();
            break;
          }
        }
      }\;

const pasteNew = \      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith(\"image/\")) {
          const pastedFile = item.getAsFile();
          if (pastedFile) pastedFiles.push(pastedFile);
        }
      }
      if (pastedFiles.length > 0) handleFilesAdded(pastedFiles);\;

code = code.replace(pasteOld, pasteNew);

const resetOld = \  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    resetHook();
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);\;

const resetNew = \  const handleReset = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setActiveIndex(0);
    resetHook();
  };

  React.useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);\;

code = code.replace(resetOld, resetNew);

const removeBtnComponent = \              <Button variant=\"ghost\" size=\"sm\" onClick={() => fileInputRef.current?.click()} aria-label=\"Replace image\">
                <RefreshCw className=\"w-4 h-4 mr-1.5\" aria-hidden=\"true\" />
                Replace
              </Button>
            )}
          </div>
          <Card
            className={\\\\elative h-[360px] flex flex-col items-center justify-center transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 $\{
              !file ? \"border-dashed bg-stone-50/50 hover:bg-stone-100/50 cursor-pointer\" : \"\"
            }\\\}\\;

const newRemoveBtnComponent = \              <Button variant=\"ghost\" size=\"sm\" onClick={() => fileInputRef.current?.click()} aria-label=\"Add images\">
                <RefreshCw className=\"w-4 h-4 mr-1.5\" aria-hidden=\"true\" />
                Add More
              </Button>
              <Button variant=\"ghost\" size=\"sm\" onClick={handleReset} aria-label=\"Clear all\" className=\"text-red-500 hover:text-red-600 hover:bg-red-50\">
                <Trash2 className=\"w-4 h-4 mr-1.5\" aria-hidden=\"true\" />
                Clear All
              </Button>
            )}
          </div>
          <Card
            className={\\\\elative h-[360px] flex flex-col items-center justify-center transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 $\{
              !file ? \"border-dashed bg-stone-50/50 hover:bg-stone-100/50 cursor-pointer\" : \"\"
            }\\\}\\;

code = code.replace(removeBtnComponent, newRemoveBtnComponent);

const thumbsOld = \          <p className=\"text-[11px] text-stone-400 pl-1\" aria-hidden=\"true\">
            Images are processed securely. Results are not stored.
          </p>
        </div>\;

const thumbsNew = \          {files.length > 1 && (
            <div className=\"flex gap-2 mt-2 overflow-x-auto pb-2 custom-scrollbar\">
              {files.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => { setActiveIndex(i); resetHook(); }}
                  className={\\\\elative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all $\{i === activeIndex ? \"border-indigo-500 shadow-sm\" : \"border-transparent opacity-60 hover:opacity-100\"}\\\}\
                >
                  <img src={f.previewUrl} alt=\"thumbnail\" className=\"w-full h-full object-cover\" />
                  <div className=\"absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 rounded-tl-sm\">{i + 1}</div>
                </button>
              ))}
            </div>
          )}
          <p className=\"text-[11px] text-stone-400 pl-1\" aria-hidden=\"true\">
            Images are processed securely. Results are not stored.
          </p>
        </div>\;

code = code.replace(thumbsOld, thumbsNew);

fs.writeFileSync('src/components/image/ImageMode.tsx', code);

