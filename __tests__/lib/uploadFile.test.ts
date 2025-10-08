import { uploadFile } from '../../lib/uploadFile';
import { supabase } from '../../lib/supabaseClient';

// Mock the supabase client
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    },
  },
}));

describe('uploadFile', () => {
  const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
  const mockUserId = 'user-123';
  const mockFolder = 'test-folder';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a file and return the correct response', async () => {
    const mockUploadPath = 'test-folder/user-123/test-uuid.txt';
    const mockPublicUrl = 'https://example.com/test-file.txt';
    
    (supabase.storage.from as jest.Mock).mockReturnThis();
    (supabase.storage.upload as jest.Mock).mockResolvedValue({
      data: { path: mockUploadPath },
      error: null,
    });
    (supabase.storage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: mockPublicUrl },
    });

    const result = await uploadFile(mockFolder, mockFile, mockUserId);

    expect(supabase.storage.from).toHaveBeenCalledWith('chat-uploads');
    // We need to adjust the expectation since the actual path will have a UUID generated
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.txt$/),
      mockFile
    );
    // We also need to update the public URL to match the dynamic path
    expect(supabase.storage.getPublicUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.txt$/)
    );
    expect(result).toEqual({
      url: mockPublicUrl,
      type: 'FILE',
      fileName: 'test.txt',
    });
  });

  it('should return IMAGE type for image files', async () => {
    const mockImageFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    
    const mockUploadPath = 'test-folder/user-123/test-uuid.jpg';
    const mockPublicUrl = 'https://example.com/test-image.jpg';
    
    (supabase.storage.from as jest.Mock).mockReturnThis();
    (supabase.storage.upload as jest.Mock).mockResolvedValue({
      data: { path: mockUploadPath },
      error: null,
    });
    (supabase.storage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: mockPublicUrl },
    });

    const result = await uploadFile(mockFolder, mockImageFile, mockUserId);

    expect(supabase.storage.from).toHaveBeenCalledWith('chat-uploads');
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.jpg$/),
      mockImageFile
    );
    expect(supabase.storage.getPublicUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.jpg$/)
    );
    expect(result.type).toBe('IMAGE');
    expect(result).toEqual({
      url: mockPublicUrl,
      type: 'IMAGE',
      fileName: 'image.jpg',
    });
  });

  it('should return VIDEO type for video files', async () => {
    const mockVideoFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
    
    const mockUploadPath = 'test-folder/user-123/test-uuid.mp4';
    const mockPublicUrl = 'https://example.com/test-video.mp4';
    
    (supabase.storage.from as jest.Mock).mockReturnThis();
    (supabase.storage.upload as jest.Mock).mockResolvedValue({
      data: { path: mockUploadPath },
      error: null,
    });
    (supabase.storage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: mockPublicUrl },
    });

    const result = await uploadFile(mockFolder, mockVideoFile, mockUserId);

    expect(supabase.storage.from).toHaveBeenCalledWith('chat-uploads');
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.mp4$/),
      mockVideoFile
    );
    expect(supabase.storage.getPublicUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^test-folder\/user-123\/[\w-]+\.mp4$/)
    );
    expect(result.type).toBe('VIDEO');
    expect(result).toEqual({
      url: mockPublicUrl,
      type: 'VIDEO',
      fileName: 'video.mp4',
    });
  });

  it('should throw error when upload fails', async () => {
    const mockError = new Error('Upload failed');
    
    (supabase.storage.from as jest.Mock).mockReturnThis();
    (supabase.storage.upload as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    await expect(uploadFile(mockFolder, mockFile, mockUserId)).rejects.toThrow(mockError);
  });

  it('should generate correct file path with folder, userId and unique ID', async () => {
    const mockUploadPath = 'test-folder/user-123/test-uuid.txt';
    const mockPublicUrl = 'https://example.com/test-file.txt';
    
    (supabase.storage.from as jest.Mock).mockReturnThis();
    (supabase.storage.upload as jest.Mock).mockResolvedValue({
      data: { path: mockUploadPath },
      error: null,
    });
    (supabase.storage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: mockPublicUrl },
    });

    await uploadFile(mockFolder, mockFile, mockUserId);

    // Check that the path contains the correct folder, userId, and file extension
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringContaining('test-folder/'),
      expect.any(File)
    );
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringContaining('user-123/'),
      expect.any(File)
    );
    expect(supabase.storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/\.txt$/),
      expect.any(File)
    );
  });
});