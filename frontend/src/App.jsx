
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

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const API = "http://127.0.0.1:8000";

  // Fetch Video Info
  const fetchVideoInfo = async () => {

    if (!url) {
      alert("Enter URL");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        `${API}/video-info`,
        { url }
      );

      setVideoInfo(response.data);

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);

      alert("Error fetching video");
    }
  };

  // Download Video
  // const downloadVideo = (itag) => {

  //   window.open(
  //     `${API}/download-video/${itag}?url=${encodeURIComponent(url)}`
  //   );
  // };

  const downloadVideo = async (itag) => {

  try {

    setDownloading(true);
    setDownloadProgress(0);

    const response = await axios({

      url: `${API}/download-video/${itag}`,
      method: "GET",

      params: {
        url: url
      },

      responseType: "blob",

      onDownloadProgress: (progressEvent) => {

        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setDownloadProgress(percentCompleted);
      }

    });

    // Create blob link
    const blob = new Blob([response.data]);

    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);

    // Extract filename
    const contentDisposition =
      response.headers["content-disposition"];

    let filename = "video.mp4";

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

    alert("Download failed");
  }
  };

  // Download Audio
  const downloadAudio = (itag) => {

    window.open(
      `${API}/download-audio/${itag}?url=${encodeURIComponent(url)}`
    );
  };

  return (

    <div className="min-h-screen bg-gray-900 text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        YouTube Downloader
      </h1>

      {/* URL INPUT */}

      <div className="flex gap-4">

        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-4 rounded text-white border border-amber-50"
        />

        <button
          onClick={fetchVideoInfo}
          className="bg-blue-500 px-6 rounded"
        >
          Fetch
        </button>

      </div>

      {/* LOADING */}

      {
        loading && (
          <p className="mt-5">
            Fetching streams...
          </p>
        )
      }

      {/* ADD PROGRESS BAR UI */}
      {
      downloading && (

        <div className="mt-6">

          <p className="mb-2">
            Downloading... {downloadProgress}%
          </p>

          <div className="w-full bg-gray-700 rounded h-5">

            <div
              className="bg-green-500 h-5 rounded"
              style={{
                width: `${downloadProgress}%`
              }}
            />

          </div>

        </div>
      )
    }
      {/* VIDEO INFO */}

      {
        videoInfo && (

          <div className="mt-10">

            {/* THUMBNAIL */}

            <img
              src={videoInfo.thumbnail}
              alt="thumbnail"
              className="w-96 rounded"
            />

            {/* TITLE */}

            <h2 className="text-2xl mt-4 font-bold">
              {videoInfo.title}
            </h2>

            {/* VIDEO STREAMS */}

            <div className="mt-8">

              <h3 className="text-xl mb-4">
                Video Qualities
              </h3>

              {
                videoInfo.video_streams.map((stream) => (

                  <div
                    key={stream.itag}
                    className="bg-gray-800 p-4 rounded mb-3 flex justify-between"
                  >

                    <div>
                      {stream.resolution} |
                      {stream.fps}fps |
                      {stream.filesize}MB |
                      {stream.codec}
                    </div>

                    <button
                      onClick={() => downloadVideo(stream.itag)}
                      className="bg-green-500 px-4 rounded"
                    >
                      Download
                    </button>

                  </div>
                ))
              }

            </div>

            {/* AUDIO STREAMS */}

            <div className="mt-10">

              <h3 className="text-xl mb-4">
                Audio Qualities
              </h3>

              {
                videoInfo.audio_streams.map((stream) => (

                  <div
                    key={stream.itag}
                    className="bg-gray-800 p-4 rounded mb-3 flex justify-between"
                  >

                    <div>
                      {stream.abr} |
                      {stream.filesize}MB |
                      {stream.codec}
                    </div>

                    <button
                      onClick={() => downloadAudio(stream.itag)}
                      className="bg-yellow-500 px-4 rounded"
                    >
                      Download MP3
                    </button>

                  </div>
                ))
              }

            </div>

          </div>
        )
      }

    </div>
  );
}

export default App;
