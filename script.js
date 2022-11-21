const { createApp } = Vue

createApp({
  data() {
    return {
      text: '',
      sortFlag: 0,
      searchResult: [],
      filteredResult: [],
      appliedFilters: [],
      descriptionToggle: [],
      musicToggle: [],
      genres: [],
      allCollectionNames: [],
      artist1: './img/1.jpg',
      artist2: './img/2.jpg',
    }
  },
  methods: {
    displayTracks: function() {
      const allCollections = new Map();
      this.allCollectionNames = [];
      for (let i = 0; i < this.filteredResult.length; ++i) {
        if (!allCollections.get(this.filteredResult[i].collectionName)) {
          allCollections.set(this.filteredResult[i].collectionName, [this.filteredResult[i].trackName]);
        }
        else {
          console.log(allCollections);
          allCollections.get(this.filteredResult[i].collectionName).push(this.filteredResult[i].trackName);
        }
      }
      this.allCollectionNames = allCollections;
    },

    playAudio: function(index, url) {
      let a = new Audio(url);
      a.play();
      this.musicToggle[index].toggle = false;
      this.musicToggle[index].sound = a;
    },

    stopAudio: function(index) {
      if (this.musicToggle[index].sound !== null) {
        this.musicToggle[index].sound.pause();
        this.musicToggle[index].sound.currentTime = 0;
      }
      this.musicToggle[index].toggle = true;
    },

    sortList: function(flag) {
      if (flag == 0) {
        if (this.appliedFilters.size == 0) {
          this.filteredResult = JSON.parse(JSON.stringify(this.searchResult));
          console.log(this.searchResult);
        }
        else {
          this.filteredResult = this.searchResult.filter(this.checkValid);
        }
        this.sortFlag = 0;
      }
      else if (flag == 1) {
        this.filteredResult.sort(function(a, b) {
          if (a.collectionName < b.collectionName) {
            return -1;
          }
          if (a.collectionName > b.collectionName) {
            return 1;
          }
          return 0;
          //return a.collectionName - b.collectionName;
        });
        this.sortFlag = 1;
      }
      else {
        this.filteredResult.sort(function(a, b) {
          return a.collectionPrice - b.collectionPrice;
        });
        this.sortFlag = 2;
      }
    },

    checkValid: function(value) {
      if (this.appliedFilters.size > 0) {
        return this.appliedFilters.has(value.primaryGenreName);
      }
      return false;
    },

    filterResults: function(flagName) {
      if (this.appliedFilters.has(flagName)) {
        this.appliedFilters.delete(flagName);
        this.genres.set(flagName, false);
      }
      else {
        this.appliedFilters.add(flagName);
        this.genres.set(flagName, true);
      }
      if (this.appliedFilters.size == 0) {
        this.filteredResult = JSON.parse(JSON.stringify(this.searchResult));
        this.sortList(this.sortFlag);
      }
      else {
        this.filteredResult = this.searchResult.filter(this.checkValid);
        this.sortList(this.sortFlag);
      }
    },

    changeToggles: function() {
      for (let genre of this.genres.keys()) {
        this.appliedFilters.delete(genre);
        this.genres.set(genre, false);
      }
      this.filteredResult = JSON.parse(JSON.stringify(this.searchResult));
      this.sortList(this.sortFlag);
      // let found = false;
      // for (let toggle of this.genres.values()) {
      //   if (toggle == true) {
      //     found = true;
      //   }
      // }
      // if (!found) {
      //   this.filteredResult = this.searchResult;
      // }
      // else {
      //   for (let genre of this.genres.keys()) {
      //     this.genres.set(genre, false);
      //   }
      // }
    },

    checkToggleConditions: function() {
      let found = false;
      for (let toggle of this.genres.values()) {
        if (toggle == true) {
          found = true;
        }
      }
      return found;
    },

    descToggle: function(index, toggle) {
      this.descriptionToggle[index] = toggle;
      this.stopAudio(index);
    },

    readSearchBox: function() {
      console.log(this.text);
      let searchRequest = 'https://itunes.apple.com/search?term=' + this.text + "&attribute=allArtistTerm&origin=*";
      fetch(searchRequest)
        .then((response) => response.json())
        .then((data) => {
          this.searchResult = data.results;
          this.filteredResult = JSON.parse(JSON.stringify(this.searchResult));
          this.sortFlag = 0;
          const newDescArr = new Array(this.searchResult.length);
          const newMusicArr = new Array(this.searchResult.length);
          const newMap = new Map();
          this.appliedFilters = new Set();
          for (let i = 0; i < this.searchResult.length; ++i) {
            newDescArr[i] = true;
            newMusicArr[i] = { 
              toggle: true, 
              sound : null 
            }
            if (!newMap.get(this.searchResult[i].primaryGenreName)) {
              newMap.set(this.searchResult[i].primaryGenreName, false);
            }
          }
          this.descriptionToggle = newDescArr;
          this.musicToggle = newMusicArr;
          this.genres = newMap;
        })
        .then(() => console.log(this.searchResult))
        .then(() => {
          if (this.searchResult.length == 0) {
            alert("No artists found!");
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}).mount('#app')
