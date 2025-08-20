import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";

interface UploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

interface UploadedFile {
  file: File;
  url?: string;
  progress: number;
  error?: string;
  uploading: boolean;
}

export default function Uploader({
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
}: UploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get signed URL mutation
  const getSignedUrlMutation = useMutation({
    mutationFn: ({ filename, contentType }: { filename: string; contentType: string }) =>
      apiClient.getUploadSignedUrl(contentType, filename),
  });

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Type de fichier non supporté: ${file.type}`;
    }
    if (file.size > maxSize) {
      return `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)}MB (max: ${maxSize / 1024 / 1024}MB)`;
    }
    return null;
  };

  const uploadFile = useCallback(async (fileData: UploadedFile, index: number) => {
    try {
      // Update file status to uploading
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: true, progress: 0 } : f
      ));

      // Get signed URL
      const { url, publicUrl } = await getSignedUrlMutation.mutateAsync({
        filename: fileData.file.name,
        contentType: fileData.file.type,
      });

      // Upload file directly to S3
      const xhr = new XMLHttpRequest();
      
      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, progress } : f
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, url: publicUrl, uploading: false, progress: 100 } : f
            ));
            resolve(publicUrl);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', fileData.file.type);
        xhr.send(fileData.file);
      });
    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));
      throw error;
    }
  }, [getSignedUrlMutation]);

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast({
        title: "Trop de fichiers",
        description: `Vous ne pouvez télécharger que ${maxFiles} fichiers maximum.`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = [];
    const validFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        file,
        progress: 0,
        uploading: false,
        error,
      };
      
      newFiles.push(uploadedFile);
      if (!error) {
        validFiles.push(uploadedFile);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Show errors
    const errorFiles = newFiles.filter(f => f.error);
    if (errorFiles.length > 0) {
      toast({
        title: "Erreurs de fichiers",
        description: `${errorFiles.length} fichier(s) invalide(s)`,
        variant: "destructive",
      });
    }

    // Upload valid files
    const uploadPromises = validFiles.map(async (fileData, index) => {
      const fileIndex = files.length + newFiles.indexOf(fileData);
      try {
        const url = await uploadFile(fileData, fileIndex);
        return url;
      } catch (error) {
        console.error('Upload error:', error);
        return null;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter(url => url !== null) as string[];
      
      if (successfulUrls.length > 0 && onUploadComplete) {
        const allUrls = files.filter(f => f.url).map(f => f.url!).concat(successfulUrls);
        onUploadComplete(allUrls);
      }
      
      if (successfulUrls.length > 0) {
        toast({
          title: "Upload terminé",
          description: `${successfulUrls.length} fichier(s) téléchargé(s) avec succès.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Certains fichiers n'ont pas pu être téléchargés.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (onUploadComplete) {
      const urls = newFiles.filter(f => f.url).map(f => f.url!);
      onUploadComplete(urls);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-testid="upload-dropzone"
      >
        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Glissez-déposez vos images ou
        </p>
        <Button
          type="button"
          onClick={openFileDialog}
          disabled={files.length >= maxFiles}
          data-testid="button-select-files"
        >
          Choisir des fichiers
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          {acceptedTypes.join(", ")} jusqu'à {maxSize / 1024 / 1024}MB chacune
        </p>
        <p className="text-xs text-gray-500">
          Maximum {maxFiles} fichiers
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              data-testid={`upload-file-${index}`}
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                {fileData.url ? (
                  <img
                    src={fileData.url}
                    alt={fileData.file.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <i className="fas fa-file-image text-gray-400"></i>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid={`file-name-${index}`}>
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(fileData.file.size / 1024).toFixed(1)} KB
                </p>
                
                {fileData.uploading && (
                  <Progress value={fileData.progress} className="h-1 mt-1" />
                )}
                
                {fileData.error && (
                  <p className="text-xs text-red-600 mt-1" data-testid={`file-error-${index}`}>
                    {fileData.error}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {fileData.uploading && (
                  <i className="fas fa-spinner animate-spin text-primary"></i>
                )}
                {fileData.url && (
                  <i className="fas fa-check-circle text-green-500"></i>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  data-testid={`button-remove-file-${index}`}
                >
                  <i className="fas fa-times text-gray-400"></i>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
