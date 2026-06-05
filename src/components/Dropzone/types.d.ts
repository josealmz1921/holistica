export interface PreviewFile {
  id?: string;
  file?: File | null;
  preview: string;
  width?: number;
  height?: number;
  base64?: string | null;
  name?: string | null;
  size?: number | null;
  position?: number
}

export type DropzoneProps = {
  getValues?: (files: PreviewFile[]) => void;
  onDelete?: (id?: string) => Promise<void>
  disabled?: boolean;
  initialValues?: Array<PreviewFile> | Array;
}