import React, { useState, useRef } from 'react';
import { Camera, Upload, QrCode, Heart, Sparkles, Filter, Video, Download, X, Play, StopCircle, RefreshCw, Layers } from 'lucide-react';
import { StudentMediaItem } from '../types';
import { INITIAL_STUDENT_MEDIA } from '../data/studentMediaDatabase';
import { PUBLIC_APP_URL } from '../config/appConfig';

export const StudentMediaHub: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<StudentMediaItem[]>(() => {
    const saved = localStorage.getItem('medha_student_media');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STUDENT_MEDIA;
      }
    }
    return INITIAL_STUDENT_MEDIA;
  });

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<StudentMediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUploader, setNewUploader] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science & AI');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Live Fest Video Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const departments = [
    'All',
    'AI & Data Science',
    'Computer Science',
    'Campus Recruitment Training',
    'Department of Statistics',
    'Management',
    'Electronics & IoT',
  ];

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      );
      localStorage.setItem('medha_student_media', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !newTitle.trim() || !newUploader.trim()) return;

    const newItem: StudentMediaItem = {
      id: `media-${Date.now()}`,
      title: newTitle.trim(),
      uploaderName: newUploader.trim(),
      department: newDepartment,
      mediaType: newMediaType,
      url: previewUrl,
      timestamp: 'Just now · Oct 24, 2026',
      likes: 1,
      resolution: '4K UHD',
      isStudentUpload: true,
    };

    const updated = [newItem, ...mediaItems];
    setMediaItems(updated);
    localStorage.setItem('medha_student_media', JSON.stringify(updated));

    // Reset Form
    setNewTitle('');
    setNewUploader('');
    setPreviewUrl('');
    setIsUploadOpen(false);
  };

  // Live Recorder functions
  const startCameraFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
    }
  };

  const stopCameraFeed = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const startLiveRecording = () => {
    if (!mediaStreamRef.current) return;
    setRecordedChunks([]);
    const recorder = new MediaRecorder(mediaStreamRef.current);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecordedVideo = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);

    const newItem: StudentMediaItem = {
      id: `live-record-${Date.now()}`,
      title: 'Live Fest Moment Capture',
      uploaderName: 'Student Live Desk',
      department: 'AI & Robotics Club',
      mediaType: 'video',
      url: videoUrl,
      timestamp: 'Live Fest Recording',
      likes: 24,
      resolution: 'HD 1080p',
      isStudentUpload: true,
    };

    const updated = [newItem, ...mediaItems];
    setMediaItems(updated);
    localStorage.setItem('medha_student_media', JSON.stringify(updated));
    stopCameraFeed();
    setIsRecorderOpen(false);
  };

  const filteredItems = mediaItems.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.department.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner with Share, Relive & Enjoy */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-[#0a1435] to-cyan-950 border border-cyan-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>MEDHA 2K26 EVENT GALLERY</span>
              <span className="text-slate-500">·</span>
              <span>OCTOBER 24, 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Share, Relive &amp; Enjoy Every Moment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Welcome to the central high-definition repository for all 500+ attendees. Upload and explore 2,000+ photos, faculty interactions, robotics showcases, and live fest recordings with zero compression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900/90 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <QrCode className="w-4 h-4" />
              <span>Mobile QR Scanner</span>
            </button>

            <button
              onClick={() => {
                setIsRecorderOpen(true);
                startCameraFeed();
              }}
              className="px-4 py-2.5 bg-rose-950/80 border border-rose-700/60 hover:border-rose-400 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Video className="w-4 h-4" />
              <span>Record Live Fest</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
            >
              <Upload className="w-4 h-4" />
              <span>Upload HD Media</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveFilter(dept)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeFilter === dept
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer bg-[#091024] border border-cyan-950 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 flex flex-col justify-between"
          >
            {/* Media Preview Box */}
            <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
              {item.mediaType === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/robot.jpeg';
                  }}
                />
              )}

              {/* Quality & Type Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-cyan-300 border border-cyan-500/30">
                  {item.resolution}
                </span>
                {item.mediaType === 'video' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                    VIDEO
                  </span>
                )}
              </div>

              {/* Like Button */}
              <button
                onClick={(e) => handleLike(item.id, e)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-transform active:scale-125 flex items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="text-[10px] font-mono pr-0.5">{item.likes}</span>
              </button>
            </div>

            {/* Info Container */}
            <div className="p-3.5 space-y-1.5">
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {item.title}
              </h3>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[130px]">{item.uploaderName}</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
              </div>

              <div className="text-[10px] font-mono text-cyan-400/90 truncate">
                {item.department}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-[#0a1024] border border-cyan-800 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="max-h-[70vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden">
                {selectedItem.mediaType === 'video' ? (
                  <video src={selectedItem.url} controls autoPlay className="max-h-[65vh] w-auto rounded-xl" />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="max-h-[65vh] w-auto object-contain rounded-xl"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedItem.title}</h3>
                  <p className="text-xs text-slate-400">
                    Uploaded by <span className="text-cyan-300 font-medium">{selectedItem.uploaderName}</span> ({selectedItem.department}) · {selectedItem.timestamp}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedItem.url}
                    download={`medha_2k26_${selectedItem.id}`}
                    className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full HD</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-[#091024] border border-cyan-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Upload Event Media to Hub
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add your high-definition photos or short video clips to Medha 2K26.
            </p>

            <form onSubmit={handleSubmitUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title / Caption</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Robotics Demo with Principal Sir"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newUploader}
                  onChange={(e) => setNewUploader(e.target.value)}
                  placeholder="e.g. A. Renuka / Student Team"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>AI &amp; Data Science</option>
                    <option>Computer Science</option>
                    <option>Campus Recruitment Training</option>
                    <option>Department of Statistics</option>
                    <option>Management</option>
                    <option>Electronics &amp; IoT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Media Type</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as 'photo' | 'video')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="photo">Photo (HD)</option>
                    <option value="video">Short Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Choose Photo / Video File</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  required
                  onChange={handleFileUpload}
                  className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-900 file:text-cyan-200 hover:file:bg-cyan-800"
                />
              </div>

              {previewUrl && (
                <div className="mt-2 aspect-video bg-black rounded-xl overflow-hidden border border-cyan-800">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!previewUrl || !newTitle || !newUploader}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium shadow-sm"
                >
                  Upload Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-sm w-full bg-[#0a1024] border-2 border-cyan-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                FAST STUDENT ACCESS
              </span>
              <h3 className="text-lg font-bold text-white">Scan to Upload Photos</h3>
              <p className="text-xs text-slate-400">
                Point your smartphone camera to upload directly to the Medha 2K26 cloud gallery.
              </p>
            </div>

            {/* Generated QR Code Card */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
              <div className="grid grid-cols-5 gap-1.5 w-36 h-36">
                <div className="bg-black col-span-2 row-span-2 rounded-sm" />
                <div className="bg-black" />
                <div className="bg-black col-span-2 row-span-2 rounded-sm" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black col-span-2 row-span-2 rounded-sm" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
              </div>
            </div>

            <div className="text-[11px] font-mono text-cyan-300 break-all px-2 select-all bg-black/60 p-2 rounded-lg border border-cyan-900/60">
              {PUBLIC_APP_URL}/#gallery
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Fest Video Recorder Simulator */}
      {isRecorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-[#091024] border border-rose-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => {
                stopCameraFeed();
                setIsRecorderOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                LIVE FEST STREAM RECORDER
              </span>
              <h3 className="text-base font-bold text-white mt-1">Capture Fest Stage Video &amp; Voice</h3>
              <p className="text-xs text-slate-400">
                Record real-time festival moments with microphone and camera access.
              </p>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-rose-950">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-mono animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  REC ACTIVE
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startLiveRecording}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopLiveRecording}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-500 transition-all"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {recordedChunks.length > 0 && !isRecording && (
                <button
                  onClick={saveRecordedVideo}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish to Gallery</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
