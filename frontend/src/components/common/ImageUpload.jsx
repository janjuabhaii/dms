import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;

/**
 * Controlled-ish image picker: parent owns the selected File via `onChange`,
 * this component only owns the preview + drag state + validation error.
 * `previewUrl` lets the parent seed an existing image (edit mode) before
 * any new file is chosen.
 */
const ImageUpload = ({ previewUrl, onChange, disabled }) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState(previewUrl || "");

  const validateAndSet = useCallback(
    (file) => {
      setError("");

      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }

      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      onChange(file);
    },
    [onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleRemove = () => {
    setLocalPreview("");
    setError("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {localPreview ? (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          <img src={localPreview} alt="Product preview" className="h-44 w-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {disabled ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/70">PNG, JPG up to {MAX_SIZE_MB}MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelect}
            disabled={disabled}
          />
        </label>
      )}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default ImageUpload;
