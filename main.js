import { songs } from './songs.js'
import { lyrics } from './lyrics.js'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'C0bra_Music'
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const cdAudio = $('#audio');
const playSong = $('.btn-toggle-play')
const playBTn = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevtBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const volumeSlider = $('#volume')
const blockVolume = $('#block')
const time = $('#current-time')
const threeDotMenu = $('.three-dot')
const nameSong = $('.song-title')
const durationTime = $('#duration-time')
const addPlaylist = $('#addplaylist')
const getForm = $('.form')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs,
    lyrics,
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h dot"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xu li phong to / thu  nho cd
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newWidth = cdWidth - scrollTop;
            // if(scrollTop > 100){
            //     cd.classList.add('hide');
            // }
            // else{
            //     cd.classList.remove('hide');

            // }
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }
        //Xu li khi click play
        playSong.onclick = function () {
            if (_this.isPlaying) {
                cdAudio.pause();

            }
            else {
                cdAudio.play()
            }
            // Khi song duoc play
            cdAudio.onplay = function () {
                _this.updatePlayingUI(true);
            }
            // Khi song duoc pause
            cdAudio.onpause = function () {
                _this.updatePlayingUI(false)
            }
        }
        // Xu li khi nhan cac phim tren bàn phím
        document.onkeydown = function (e) {
            const tag = e.target.tagName.toLowerCase()
            if (tag === 'input' || tag === 'textarea') {
                return
            }
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (cdAudio.paused) {
                        cdAudio.play();
                        _this.updatePlayingUI(true);
                    }
                    else {
                        cdAudio.pause()
                        _this.updatePlayingUI(false)
                    }
                    break;
                case 'ArrowRight':
                    cdAudio.currentTime = Math.min(cdAudio.currentTime + 5, cdAudio.duration)
                    break;
                case 'ArrowLeft':
                    cdAudio.currentTime = Math.max(cdAudio.currentTime - 5, 0)
                    break;
                case 'ArrowUp':
                    cdAudio.volume = Math.min(cdAudio.volume + 0.1, 1)
                    volumeSlider.value = cdAudio.volume
                    const percentUp = cdAudio.volume * 100
                    volumeSlider.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${percentUp}%, #ccc ${percentUp}%, #ccc 100%)`
                    break;
                case 'ArrowDown':
                    e.preventDefault()
                    cdAudio.volume = Math.max(cdAudio.volume - 0.1, 0)
                    volumeSlider.value = cdAudio.volume
                    const percentDown = cdAudio.volume * 100
                    volumeSlider.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${percentDown}%, #ccc ${percentDown}%, #ccc 100%)`
                    break;
                case 'KeyM':
                    cdAudio.muted = !cdAudio.muted
                    if (cdAudio.muted) {
                        blockVolume.className = 'fa-solid fa-volume-xmark'
                    }
                    else {
                        blockVolume.className = 'fa-solid fa-volume-high'
                    }
                    break;
                case 'KeyN':
                    nextBtn.click();
                    break;
                case 'KeyP':
                    prevtBtn.click();
                    break;
                case 'KeyR':
                    repeatBtn.click();
                    break;
                case 'KeyS':
                    randomBtn.click();
                    break;
                default:
                    break;
            }
        }

        // Tien do cua bai hat, fill thanh thời lượng bài hát va thoi gian bai hat
        cdAudio.ontimeupdate = function () {
            if (cdAudio.duration) {
                const progressBar = (cdAudio.currentTime / cdAudio.duration) * 100
                progress.value = progressBar
                time.textContent = new Date(cdAudio.currentTime * 1000).toISOString().slice(15, 19)
                progress.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${progressBar}%, #ccc ${progressBar}%, #ccc 100%)`
                const minutes = Math.floor(cdAudio.duration / 60)
                const seconds = Math.floor(cdAudio.duration % 60)
                durationTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`
            }
        }
        progress.oninput = function () {
            const percent = progress.value
            progress.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${percent}%, #ccc ${percent}%, #ccc 100%)`
            cdAudio.currentTime = (percent / 100) * cdAudio.duration
        }
        // Xu li tua nhac
        progress.onchange = function (e) {
            // console.log(e.target.value / 100 * cdAudio.duration)
            const newTime = e.target.value / 100 * cdAudio.duration;
            cdAudio.currentTime = newTime;
        }
        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            }
            else {
                _this.nextSongs();
            }
            cdAudio.play();
            _this.updatePlayingUI(true);
            _this.render();
            _this.scrollToActiveSong()
        }
        // Khi prev song
        prevtBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            }
            else {
                _this.prevSongs();
            }
            cdAudio.play();
            _this.updatePlayingUI(true);
            _this.render();
        }
        // Random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xu li lap lai bai
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }
        // Xu li next song khi audio ended
        cdAudio.onended = function () {
            if (_this.isRepeat) {
                cdAudio.play();
            }
            else {
                nextBtn.onclick()
            }
        }
        // xu li khi click vao icon loa
        blockVolume.onclick = function () {
            let lastVolume = cdAudio.volume
            if (cdAudio.muted || cdAudio.volume === 0) {
                cdAudio.muted = false
                cdAudio.volume = lastVolume
                blockVolume.className = 'fa-solid fa-volume-high'
            }
            else {
                cdAudio.muted = true
                lastVolume = cdAudio.volume
                blockVolume.className = 'fa-solid fa-volume-xmark'
            }

        }
        //Xu li tang/ giam am luong và fill tahnh am luong
        volumeSlider.oninput = function (e) {
            const volumeValue = e.target.value
            cdAudio.volume = volumeValue
            const percent = volumeValue * 100
            volumeSlider.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${percent}%, #ccc ${percent}%, #ccc 100%)`
        }
        document.addEventListener('DOMContentLoaded', function () {
            cdAudio.volume = volumeSlider.value
            const percent = volumeSlider.value * 100;
            volumeSlider.style.background = `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${percent}%, #ccc ${percent}%, #ccc 100%)`

        })
        // Lang nghe hanh vi click vao playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode && !e.target.closest('.option')) {
                // Xu li click vao song 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.loadLyric()
                    _this.render()
                    cdAudio.play();
                    _this.updatePlayingUI(true)
                }
            }
        }
        // Xu li khi click vao 3 cham
        playList.addEventListener('click', e => {
            if (e.target.closest('.dot')) {
                e.stopPropagation();
                const songNode = e.target.closest('.song');
                const index = Number(songNode.dataset.index);
                threeDotMenu.classList.toggle('show');
                const rect = e.target.getBoundingClientRect();
                const top = rect.top + window.scrollY;
                const left = rect.left + window.scrollX + 20;
                threeDotMenu.style.top = `${top}px`;
                threeDotMenu.style.left = `${left}px`;
                nameSong.textContent = songs[index].name;
            }
        });
        // play now trong three dot menu
        $('.play-now').onclick = function (e) {
            const index = songs.findIndex(song => song.name === nameSong.textContent);
            if (index !== -1) {
                _this.currentIndex = index;
                _this.loadCurrentSong();
                _this.loadLyric();
                _this.render();
                cdAudio.play();
                _this.updatePlayingUI(true);
            }
        }
        // Xử lý khi click nút tải xuống trong menu 3 chấm
        $('.download').onclick = function (e) {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = cdAudio.src;
            link.download = app.currentSong.name + '.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        // Xu li khi click vao dau cong trong playlist
        addPlaylist.onclick = function (e) {
            e.stopPropagation()
            getForm.classList.add('show')
        }
        // Xu khi click vao nut chia se trong menu 3 cham
        $('.share').onclick = function (e) {
            e.stopPropagation();
            if (navigator.share) {
                navigator.share({
                    title: app.currentSong.name,
                    text: 'Nghe bài này hay lắm 🎵',
                    url: window.location.href   
                })
                    .then(() => console.log('Chia sẻ thành công'))
                    .catch(err => console.log('Hủy chia sẻ', err));
            } else {
                alert('Trình duyệt của bạn không hỗ trợ chia sẻ trực tiếp.');
            }
        };
        // Xu li khi click dau x tren form
        $('.closeForm-btn').onclick = function (e) {
            e.stopPropagation()
            getForm.classList.remove('show')
        }
        getForm.onclick = function (e) {
            e.stopPropagation()
        }
        getForm.onsubmit = function (e){
            e.preventDefault()
            getForm.classList.remove('show')
            $('.incoming').classList.add('show')
        }
        // khi click bên ngoai man hinh
        document.addEventListener('click', () => {
            threeDotMenu.classList.remove('show')
            getForm.classList.remove('show')
            $('.incoming').classList.remove('show')
        });
    },
    loadLyric: function () {
        const currentLyric = this.lyrics.find(lyric => lyric.name === this.currentSong.name);
        if (currentLyric) {
            const lyricLines = currentLyric.lyric.trim().split('\n').map(line => `<p>${line.trim()}</p>`).join('');
            document.querySelector('.lyric-lines').innerHTML = lyricLines;
        } else {
            document.querySelector('.lyric-lines').innerHTML = '<p>Lyric not found.</p>';
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        cdAudio.src = this.currentSong.path
        document.title = this.currentSong.name + ' | ' + this.currentSong.singer

    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    updatePlayingUI: function (isPlay) {
        this.isPlaying = isPlay;
        playBTn.classList.toggle('playing', isPlay);
        cdThumb.classList.toggle('cd-thumb-rotate', isPlay);
    },
    updateVolumeUI: function () {

    },
    nextSongs: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.loadLyric();
    },
    prevSongs: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.loadLyric();
    },
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        console.log(newIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.loadLyric();
    },
    start: function () {
        this.loadConfig()


        // Dinh nghia cac thuoc tinh cho Object
        this.defineProperties();

        // Lang nghe/ xu li cac su kien 
        this.handleEvent();

        //Tai thong tin bai hat
        this.loadCurrentSong();

        this.loadLyric();

        this.render();

        // Hien thi trang thai ban dau cua buttom repeat / random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start();
