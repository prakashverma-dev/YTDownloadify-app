// import './App.css'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'

import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const API = "http://127.0.0.1:8000";

  // const API = "https://your-render-backend-url.onrender.com"; //After Backend Deployment Add URL here

  // Fetch Video Info
  const fetchVideoInfo = async () => {
    if (!url) {
      alert("Enter URL");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API}/video-info`, { url });

     setVideoInfo(response.data);

      setVideoUrl(url);

      setUrl("");

      setLoading(false);

      
    } catch (error) {
      console.log(error);

      setLoading(false);

      alert("Error fetching video");
    }
  };

  // Download Video
  // const downloadVideo = (itag) => {

  //   scrollTo(0, 0);

  //   window.open(
  //     `${API}/download-video/${itag}?url=${encodeURIComponent(videoUrl)}`
  //   );
  // };

  const downloadVideo0 = async (itag) => {
    // SCROLL TO TOP
    // window.scrollTo({
    //   top: 0,
    //   behavior: "smooth"
    // });

    scrollTo(0, 0);

    try {
      setDownloading(true);
      setDownloadProgress(0);

      // FAKE SMOOTH PROGRESS

      let progress = 0;

      const fakeProgressInterval = setInterval(() => {
        progress += 4;

        // Stop fake progress at 90%
        if (progress >= 90) {
          clearInterval(fakeProgressInterval);
        }

        setDownloadProgress(progress);
      }, 500);

      // -----------------------------
      // ACTUAL DOWNLOAD
  
      const response = await axios({
        url: `${API}/download-video/${itag}`,
        method: "GET",

        params: {
          url: videoUrl,
        },

        responseType: "blob",
      });

      
      setDownloadProgress(100); // COMPLETE PROGRESS
      clearInterval(fakeProgressInterval);  // STOP INTERVAL

      // -----------------------------
      // DOWNLOAD FILE

      const blob = new Blob([response.data]);

      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);

      const contentDisposition = response.headers["content-disposition"];

      // console.log(response.headers);

      
      let filename = "video.mp4";

      // Title extracting from contentDisposition -

      if (contentDisposition) {
        // Match filename*=utf-8''
        const utf8Match = contentDisposition.match(/filename\*=utf-8''(.+)/);

        if (utf8Match && utf8Match[1]) {

          filename = decodeURIComponent(utf8Match[1]);

        } else {

          // fallback normal filename=
            const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/);  

            if (normalMatch && normalMatch[1]) {
              filename = normalMatch[1];
            }
        }
      }

      // console.log("File Name : ", filename)

      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      // HIDE AFTER SHORT DELAY
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 1000);

    } catch (error) {
      console.log(error);

      setDownloading(false);

      alert("Download failed");
    }
  };

  const downloadVideo = async (itag) => {

      scrollTo(0, 0);

      let fakeProgress = 0;
      let interval;

      try {

        setDownloading(true);
        setDownloadProgress(0);

        // Smooth fake progress animation
        interval = setInterval(() => {

          // fakeProgress += Math.random() * 6;
          fakeProgress += (90 - fakeProgress) * 0.08;

          // Stop at 90% until real download finishes
          if (fakeProgress >= 90) {

            fakeProgress = 90;

            clearInterval(interval);
          }

          setDownloadProgress(Math.floor(fakeProgress));

        }, 300);

        const response = await axios({

          url: `${API}/download-video/${itag}`,

          method: "GET",

          params: {
            url: videoUrl
          },

          responseType: "blob"

        });

        // Actual download finished
        clearInterval(interval);

        setDownloadProgress(100);

        // Create blob
        const blob = new Blob([response.data]);

        const link = document.createElement("a");

        link.href = window.URL.createObjectURL(blob);

        // Extract filename
        const contentDisposition =
          response.headers["content-disposition"];

        let filename = "video.mp4";

       
        if (contentDisposition) {

          // Handle UTF-8 encoded filename*
          const utf8Match = contentDisposition.match(
            /filename\*=utf-8''(.+)/
          );

          if (utf8Match?.[1]) {

            filename = decodeURIComponent(utf8Match[1]);

          } else {

            // Fallback normal filename=
            const normalMatch = contentDisposition.match(
              /filename="?([^"]+)"?/
            );

            if (normalMatch?.[1]) {
              filename = normalMatch[1];
            }
          }
        }

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        // Cleanup object URL
        window.URL.revokeObjectURL(link.href);

        // Small delay to show 100%
        setTimeout(() => {

          setDownloading(false);

          setDownloadProgress(0);

        }, 800);

      } catch (error) {

        clearInterval(interval);

        console.log(error);

        setDownloading(false);

        setDownloadProgress(0);

        alert("Download failed");
      }
    };

  // Download Audio
  // const downloadAudio = (itag) => {
  //   // SCROLL TO TOP
  //   // window.scrollTo({
  //   //   top: 0,
  //   //   behavior: "smooth"
  //   // });
  //   scrollTo(0, 0);

  //   window.open(`${API}/download-audio/${itag}?url=${encodeURIComponent(url)}`);
  // };

  const downloadAudio0 = async (itag) => {

      scrollTo(0, 0);

      try {

        setDownloading(true);
        setDownloadProgress(0);

        const response = await axios({

          url: `${API}/download-audio/${itag}`,
          method: "GET",

          params: {
            url: videoUrl
          },

          responseType: "blob",

          onDownloadProgress: (progressEvent) => {

            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setDownloadProgress(percentCompleted);
          }

        });

        const blob = new Blob([response.data]);

        const link = document.createElement("a");

        link.href = window.URL.createObjectURL(blob);

        let filename = "audio.mp3";

        const contentDisposition =
          response.headers["content-disposition"];

        

        if (contentDisposition) {

          const match = contentDisposition.match(/filename="?(.+)"?/);

          if (match?.[1]) {
            filename = match[1];
          }
        }
        
        

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setDownloading(false);

      } catch (error) {

        console.log(error);

        setDownloading(false);

        alert("Audio download failed");
      }
    };


    const downloadAudio = async (itag) => {

      scrollTo(0,0);
      let fakeProgress = 0;
      let interval;

      try {

        setDownloading(true);
        setDownloadProgress(0);

        // Smooth fake progress
        interval = setInterval(() => {

          fakeProgress += Math.random() * 8;

          // Stop fake progress at 90%
          if (fakeProgress >= 90) {
            fakeProgress = 90;
            clearInterval(interval);
          }

          setDownloadProgress(Math.floor(fakeProgress));

        }, 300);

        const response = await axios({

          url: `${API}/download-audio/${itag}`,

          method: "GET",

          params: {
            url: videoUrl
          },

          responseType: "blob"

        });

        // Download completed
        clearInterval(interval);

        setDownloadProgress(100);

        const blob = new Blob([response.data]);

        const link = document.createElement("a");

        link.href = window.URL.createObjectURL(blob);

        let filename = "audio.mp3";

        const contentDisposition =
          response.headers["content-disposition"];

        // console.log(contentDisposition)

        if (contentDisposition) {

          // Handle UTF-8 encoded filename*
          const utf8Match = contentDisposition.match(
            /filename\*=utf-8''(.+)/
          );

          if (utf8Match?.[1]) {

            filename = decodeURIComponent(utf8Match[1]);

          } else {

            // Fallback normal filename=
            const normalMatch = contentDisposition.match(
              /filename="?([^"]+)"?/
            );

            if (normalMatch?.[1]) {
              filename = normalMatch[1];
            }
          }
        }


        // console.log(filename)

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        // Small delay so user sees 100%
        setTimeout(() => {

          setDownloading(false);
          setDownloadProgress(0);

        }, 800);

      } catch (error) {

        clearInterval(interval);

        console.log(error);

        setDownloading(false);

        setDownloadProgress(0);

        alert("Audio download failed");
      }
    };


  return (

    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">YouTube Downloader</h1>

      {/* URL INPUT */}

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-4 rounded text-white border border-amber-50"
        />

        <button onClick={fetchVideoInfo} className="bg-blue-500 px-6 rounded">
          Fetch
        </button>
      </div>

      {/* LOADING */}

      {loading && <p className="mt-5">Fetching streams...</p>}

      {/* ADD PROGRESS BAR UI */}
      {downloading && (
        <div className="mt-6">
          <p className="mb-2 text-lg">Downloading... {downloadProgress}%</p>

          <div className="w-full bg-gray-700 rounded h-5 overflow-hidden">
            <div
              className="bg-green-500 h-5 transition-all duration-300"
              style={{
                width: `${downloadProgress}%`,
              }}
            />
          </div>
        </div>
      )}
      {/* VIDEO INFO */}

      {videoInfo && (
        <div className="mt-10">
          {/* THUMBNAIL */}

          <img
            src={videoInfo.thumbnail}
            alt="thumbnail"
            className="w-96 rounded"
          />

          {/* TITLE */}

          <h2 className="text-2xl mt-4 font-bold">{videoInfo.title}</h2>

          {/* VIDEO STREAMS */}

          <div className="mt-8">
            <h3 className="text-xl mb-4">Video Qualities</h3>

            {videoInfo.video_streams.map((stream, index) => (
              
              <div
                key={stream.itag}
                className="bg-gray-800 p-4 rounded mb-3 flex justify-between"
              >

                <div>
                
                   {index+1}. &nbsp; &nbsp; {stream.resolution} - {stream.filesize}MB - {stream.fps}fps | Codec: {stream.codec}, itag : {stream.itag}

                </div>

                <button
                  onClick={() => downloadVideo(stream.itag)}
                  className="bg-green-500 px-4 rounded"
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          {/* AUDIO STREAMS */}

          <div className="mt-10">
            <h3 className="text-xl mb-4">Audio Qualities</h3>

            {videoInfo.audio_streams.map((stream, index) => (
              <div
                key={stream.itag}
                className="bg-gray-800 p-4 rounded mb-3 flex justify-between"
              >
                <div>
                  {index+1}. &nbsp; &nbsp;
                  {stream.abr} - {stream.filesize}MB | Codec : {stream.codec}, itag: {stream.itag}
                </div>

                <button
                  onClick={() => downloadAudio(stream.itag)}
                  className="bg-yellow-500 px-4 rounded"
                >
                  Download MP3
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
