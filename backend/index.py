'''
Your CLI logic will now become API endpoints.

You will create:

APIs
1. /video-info

Returns:

title
thumbnail
qualities
2. /download-video

Downloads selected quality

3. /download-audio

Downloads mp3



'''

# uvicorn index:app --reload
# https://youtu.be/rRQ8oKCoYrQ?si=gPjCpQwOA4lfUcut

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pytubefix import YouTube
import ffmpeg
import os
import re
import uuid
from fastapi import BackgroundTasks

app = FastAPI()

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# -----------------------------
# Folders
# -----------------------------

DOWNLOAD_FOLDER = "merge_downloads"
TEMP_FOLDER = "raw_temp"

os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# -----------------------------
# Request Model
# -----------------------------


class VideoRequest(BaseModel):
    url: str

# -----------------------------
# HOME API END POINT
# -----------------------------


@app.get("/")
def home():
    return {"message": "YouTube Downloader Backend Running"}

# -----------------------------
# VIDEO INFO API END POint
# -----------------------------


@app.post("/video-info")
def get_video_info(data: VideoRequest):

    try:
        yt = YouTube(data.url)

        # Clean title
        safe_title = re.sub(r'[<>:"/\\|?*]', '-', yt.title)
        safe_title = re.sub(r'[\u200B-\u200D\uFEFF]', '', safe_title).strip()

        # VIDEO STREAMS
        video_streams = yt.streams.filter(
            only_video=True,
            file_extension='mp4'
        ).order_by('resolution').desc()

        video_data = []

        for stream in video_streams:

            filesize = round(stream.filesize / (1024 * 1024), 2)

            video_data.append({
                "itag": stream.itag,
                "resolution": stream.resolution,
                "fps": stream.fps,
                "filesize": filesize,
                "codec": stream.video_codec
            })

        # AUDIO STREAMS
        audio_streams = yt.streams.filter(
            only_audio=True,
            file_extension='mp4'
        ).order_by('abr').desc()

        audio_data = []

        for stream in audio_streams:

            filesize = round(stream.filesize / (1024 * 1024), 2)

            audio_data.append({
                "itag": stream.itag,
                "abr": stream.abr,
                "filesize": filesize,
                "codec": stream.audio_codec
            })

        return {
            "title": safe_title,
            "thumbnail": yt.thumbnail_url,
            "video_streams": video_data,
            "audio_streams": audio_data
        }

    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# DOWNLOAD VIDEO
# -----------------------------


@app.get("/download-video/{itag}")
def download_video(url: str, itag: int, background_tasks: BackgroundTasks):

    try:
        yt = YouTube(url)

        safe_title = re.sub(r'[<>:"/\\|?*]', '-', yt.title)
        safe_title = re.sub(r'[\u200B-\u200D\uFEFF]', '', safe_title).strip()

        video_stream = yt.streams.get_by_itag(itag)

        unique_id = str(uuid.uuid4())

        video_path = os.path.join(
            TEMP_FOLDER,
            f"{unique_id}_video.mp4"
        )

        audio_path = os.path.join(
            TEMP_FOLDER,
            f"{unique_id}_audio.mp4"
        )

        # output_filename = f"{safe_title}.mp4"

        output_filename = (
            f"{safe_title}"
            f" [{video_stream.resolution}_{video_stream.fps}fps]"
            f".mp4"
        )

        output_path = os.path.join(
            DOWNLOAD_FOLDER,
            output_filename
        )

        # Download video
        video_stream.download(
            output_path=TEMP_FOLDER,
            filename=f"{unique_id}_video.mp4"
        )

        # Best audio
        audio_stream = yt.streams.filter(
            only_audio=True,
            file_extension='mp4'
        ).order_by('abr').desc().first()

        audio_stream.download(
            output_path=TEMP_FOLDER,
            filename=f"{unique_id}_audio.mp4"
        )

        # Merge
        input_video = ffmpeg.input(video_path)
        input_audio = ffmpeg.input(audio_path)

        ffmpeg.output(
            input_video,
            input_audio,
            output_path,
            vcodec='copy',
            acodec='aac'
        ).run(overwrite_output=True)

        # Cleanup raw_temp audio and video files -
        os.remove(video_path)
        os.remove(audio_path)

        # Delete final merged file AFTER response is sent -
        background_tasks.add_task(os.remove, output_path)

        # print("output_filenamerowdyyyyyy :", output_filename)

        return FileResponse(
            output_path,
            media_type='video/mp4',
            filename=output_filename 
        )

    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# DOWNLOAD AUDIO
# -----------------------------


@app.get("/download-audio/{itag}")
def download_audio(url: str, itag: int, background_tasks: BackgroundTasks):

    try:
        yt = YouTube(url)

        safe_title = re.sub(r'[<>:"/\\|?*]', '-', yt.title)
        safe_title = re.sub(r'[\u200B-\u200D\uFEFF]', '', safe_title).strip()

        audio_stream = yt.streams.get_by_itag(itag)

        unique_id = str(uuid.uuid4())

        temp_audio = os.path.join(
            TEMP_FOLDER,
            f"{unique_id}.mp4"
        )

        # output_filename = f"{safe_title}.mp3"

        output_filename = (
            f"{safe_title}"
            f" [{audio_stream.abr}]"
            f".mp3"
        )

        output_path = os.path.join(
            DOWNLOAD_FOLDER,
            output_filename
        )

        # Download
        audio_stream.download(
            output_path=TEMP_FOLDER,
            filename=f"{unique_id}.mp4"
        )

        # Convert to mp3
        ffmpeg.input(temp_audio).output(
            output_path,
            format='mp3',
            acodec='libmp3lame'
        ).run(overwrite_output=True)

        # Cleanup
        os.remove(temp_audio)

        # Delete final audio file AFTER response is sent -
        background_tasks.add_task(os.remove, output_path)

        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename=output_filename
        )

    except Exception as e:
        return {"error": str(e)}
