import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined, FileOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const { Dragger } = Upload;

interface FileUploadProps {
  taskId: number;
  onUploadComplete?: (attachment: any) => void;
}

export default function FileUpload({ taskId, onUploadComplete }: FileUploadProps) {
  const { token } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `/api/tasks/${taskId}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          setUploadedFiles((prev) => [...prev, response.data.data]);
          message.success(`File "${file.name}" uploaded successfully`);
          onUploadComplete?.(response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [taskId, token, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div>
      <Dragger {...getRootProps()} style={{ marginBottom: 16 }}>
        <input {...getInputProps()} />
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
        </p>
        <p className="ant-upload-hint">
          Support: images, PDF, Word, Excel (max 10MB)
        </p>
      </Dragger>

      {uploading && <Progress percent={50} status="active" />}

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Uploaded Files:</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                marginBottom: 8,
              }}
            >
              <FileOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ flex: 1 }}>{file.fileName}</span>
              <span style={{ color: '#999', fontSize: 12, marginRight: 16 }}>
                {(file.fileSize / 1024).toFixed(1)} KB
              </span>
              <CloseOutlined
                style={{ cursor: 'pointer', color: '#ff4d4f' }}
                onClick={() => {
                  setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
