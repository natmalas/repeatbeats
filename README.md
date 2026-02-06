# RepeatBeats 🎼
A web app for customising YouTube playback. Create presets to customise playback, playlists to order your videos, bookmark videos to watch later, and much more.

## Live Site
https://repeatbeats.com

Publicly available

## Features
- Save videos
- Create presets to customise playback
- Bookmark & star videos
- Organise videos into playlists
- Watch time
- Offline cache
- 9+ themes

## Disclaimer
This website uses the YouTube iFrame player API, and it uses it as permitted. There are no attempts to “hack” playback or otherwise manipulate the video in a way that would be against the ToS. All features provided in conjunction with the iFrame player use only the functions made available (play, pause, seek, mute).

## Why I Built This
As someone who is always listening to music, I was dissatisfied with the customisation options given by major platforms. So, three years ago, I decided to make on RepeatBeats. It started just with the ability to set the video’s start and end times. Over time, it evolved to include more and more features - starring, playlists, skipping sections, etc. After several iterations, I decided last month to build it from the ground up “properly” - good enough and solid enough for other people apart from my friends and I to use. This final version - hopefully - accomplishes that goal.

## Feature Breakdown
### Presets
Presets are the method used to customise playback. Presets decide:

when the video starts

when the video ends

Presets can also contain sections, which can either be “skip” or “repeat” sections.

Skip sections will be skipped, as the name implies. Repeated sections will be repeated for as many times as defined in the preset, up to 10 times.

### Core Playback

Playback runs in the YT iFrame player. Every 50ms, an interval is run to check whether:

- the video is within the current preset’s start & end times

- the video is not within any sections to be skipped

If the former is true, the video will seek to the preset start. If the latter is true, the video will seek to the end of the section. 

This enforcement, and all other preset-related enforcement, is disabled while the preset is being edited or a preset is being created.

### Data Storage
To improve performance and reduce server load, data is stored and fetched locally after the first time that it is called from the server. Whenever any data is changed, the website will first make a call to the backend to update that data in the database; if this is successful, it will then update the local data.

### Audio Playback
*Note: for legal reasons, this functionality is restricted*


Playback can be switched between video and audio where an audio file for the specific video is available. Whenever playback is switched, the inactive player is paused and muted and playback continues for the active player.

## Screenshots
![Player](https://repeatbeats.com/player.png)
![Search](https://repeatbeats.com/searching.png)
![Edit Preset](https://repeatbeats.com/edit-preset.png)

## Architecture Overview
### Major Components
Vue - frontend
- manages UI

Laravel - backend
- dispatches jobs, authorises users, sets rate limits

MySQL - database
- stores all data

Redis - queues
- for downloading audio

R2
- for storing audio and database backups

Cron Job
- for creating database backups

## Data Model
### Users
Stores all user-related details necessary for authorisation
### Videos
On the backend, stores only video metadata. On the frontend, video metadata and user-specific video data are denormalised into a single array
### UserVideo
On the backend, links users to videos and stores user-specific video data, such as stars, bookmarks, and watch time
### Presets
Stores all preset data, such as title, start & end time, sections, etc.
### Playlists
Stores playlist metadata, such as title and ownership
### PlaylistVideo
Links playlists to videos
### VideoAudio
Links audio files to videos, and stores the unique file name of audio files

## Data Management
The website contains 3 layers of data:
- store data, accessed via the main video.js store, which is lost on page unmount
- local data, stored in IndexedDB, which persists on page unmount
- permanent data, which is stored in the MySQL database on the backend

Video, preset, and playlist objects are always standardised using their respective “conform” function (conformVideo, conformPreset, conformPlaylist) - these ensure the object has the correct fields and guarantee consistency between states. They also handle updating timestamps.

All store refs are aggregated into a singular ```data.js``` store for ease of retrieval

### IndexedDB
All IDB logic is kept in the ```local.js``` file. It has no knowledge of the video.js store or the backend and does not call any non-helper functions outside of itself.
### Backend
All backend logic is kept in the ```backend.js``` file. It has no knowledge of the video.js store or IDB and does not call any non-helper functions outside of itself.
### video.js Store
The store is the primary source of truth for all components and functions within the program. It contains the data for all videos, presets, audio, and playlists.

On page mount, the store will always check to see whether any local data can be accessed. If no, then it will make a call to the backend and store the data locally.

The store contains all functions relating to any CUD operations of the data, e.g. creating a preset or editing a playlist. Whenever such a function is called, it follows this order:

- first, the backend is queried
- if it fails, the error is logged, the user is shown an alert, and the function terminates.
- if it succeeds, the mutated data is saved to IDB
- finally, the store data is updated


## Core Flows
### Adding a Video
The frontend parses and sends the YT id of the video given by the user. The backend checks whether the video exists by querying the YT api. If it exists, it will check if the user has it already; if not, it will insert a field into the ```user_video``` table and a blank new preset; then it will return the video & preset to the frontend. The frontend will then set the video to the current video and store the new video and preset data locally.
### Adding a Preset
The frontend validates the preset, ensuring it is within the video duration, that no sections overlap, etc. The backend has a single endpoint for creating and updating presets. Upon receiving it, it will check whether a) the preset has an id that exists and b) the preset belongs to the user. If both conditions are true, it updates the preset; if not, it creates it and returns the preset data. The frontend sets the new preset as the current preset.
### Watch Time
Each video object has three attributes relating to watch time:
- watch_time - this stores the watch time the video had when it was first fetched from the backend
- watch_time_addendum - this stores the watch time the user has accumulated that has not yet been sent to the backend
- watch_time_dirty - this stores watch time that the user has accumulated that has not yet been added to watch_time_addendum; this attribute is never saved locally and is lost upon page unmount

On the UI, each video’s total watch time is an accumulation of all 3 of these attributes

On page mount, two intervals are set. One is set to run every second. If the current video is playing, its dirty watch time is incremented by 1. The second interval runs every 10 seconds. If the current video’s dirty watch time is > 5, it adds the dirty watch time to the video’s addendum time and stores the addendum time locally. The second interval also runs a check - if the lastStoredWatchTime was less than 15 minutes ago, or is invalid, it will query the backend’s update-watch-time endpoint.

The backend receives an array of video ids and their addendums. It will filter each video to ensure that:
- the user has that video
- the video’s addendum is at least 5

If no videos pass, the function terminates. If any do, the backend will go through each video and add the addendum to the user_video’s watch_time field. In either case, it returns a successful response.
Upon receiving a successful response, the frontend will do the following:

- update the lastStoredWatchTime to the current time
- go through each video with an addendum > 5 and clear its addendum to 0, saving it to local storage
### Refreshing
Since user doesn’t sync between browsers or devices, users have the option to manually refresh their data. This is non-intrusive and does not impact the UI apart from a small spinning icon in the header. When the refresh icon is pressed, the following occurs:
- the video store makes a query to the backend to fetch the new data
- if it fails, the user is alerted, and the function is terminated without mutating any local data
- if it succeeds, the data is normalised and stored in IDB
- the store data is then updated accordingly

There is no conflict of data, as the backend always returns the latest data from the database, and the new data always replaces the local data
### Audio Download
*Note: for legal reasons, this functionality is restricted*

Upon trying to download an audio for the current video, the backend will run the following checks:
audio for the video doesn’t exist
user has the audio_allowed flag
user has the video they want to download
If all pass, it will dispatch a job that will use yt-dlp to attempt to download the audio. Meanwhile, the frontend will set a timeout for 30s (during which further downloads are prohibited) and then make a call to the backend for the audio url. If no audio is found, re-download is made possible
Audio files are stored in the R2 bucket and are given a unique UUID which is stored in the video_audio table. 
### Playback Mode
*Note: for legal reasons, this functionality is restricted*

Users can switch between video and audio playback if the frontend has an audio url for the currently playing video. Upon first playing a video, the frontend will create a blob based on the data given by the audio endpoint from the backend and play that. Switching between video and audio will mute and pause the inactive player, and playback is synced upon switching
### Audio profiles
*Note: for legal reasons, this functionality is restricted*

When the current video has a valid audio url, users can choose to generate an audio profile for that audio. The process is as follows:
- first, the frontend checks that a valid audio file exists
- it ensures that the profile is valid also
- then it will apply the profile effects to the audio file using the Web Audio API and output a blob url
- the blob is then played and saved for as long as the current video is selected, so that the user can switch between playback modes without constantly waiting for the profile to be applied
### Authorisation
All authorisation is handled by the auth store:
- storing username & session token
- logging out / signing up / logging in
- managing state refs
- clearing data on session exit

## Security & Cost
### Rate Limiting
Endpoints have been grouped into categories with their respective rate limits per IP address according to frequency of usage
## Audio Restrictions
Only users with the audio_allowed flags can download and access audio
## Streaming
Audio files are not exposed to users - instead, the backend has an endpoint which, if called to with an audio id, will run the following checks:
- user has audio_allowed flag
- audio exists in video_audio table
- user has the video in user_video
- file exists

If all checks are passed, the backend will stream the audio file from the R2 bucket.


## Limitations
- No cross-device sync
- Infrequent bugs/issues related to playback (fixed by switching videos)

## Roadmap
Currently, I feel that the website has all the core features it needs. That said, there are more features I would be interested in adding in the future, such as:
- live syncing (websockets)
- video sharing
- importing playlists

## About Me
I'm a full stack developer/uni student with 8 years of experience. My main stack is Vue for frontend and Laravel for backend. I focus on building production-quality tools that I actually use, and I’m actively expanding my public portfolio.
