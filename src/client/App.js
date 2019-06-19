import React, { Component } from 'react';
import axios from "axios";

import debounce from "./utils/debounce";

import LoadingIcon from "./components/svg/LoadingIcon";
import AlertIcon from "./components/svg/AlertIcon";
import CheckIcon from './components/svg/CheckIcon';
import ThumbItem from './components/ThumbItem';

const DEBOUNCE_DELAY = 400; // milliseconds

const initState = {
  isLoading: false,
  isProcessing: false,
  showPreview: false,
  pics: {
    small: null,
    medium: null,
    large: null
  },
  url: '',
  error: null
}

export default class App extends Component {

  state = Object.assign({}, initState);

  handleInputChange = (e) => {
    const url = e.target.value;
    this.setState({ ...this.state, url });
    this.preCheck(url);
  }

  // Set state helper
  ss = args => {
    return this.setState({
      ...this.state,
      ...args
    });
  }

  preCheck = url => {
    // No url defined, reset and exit
    if (!url.length) {
      this.setState(initState);
      return;
    }

    // Reset (except url) if trying after server side process
    if (this.state.pics.large) {
      this.setState({ ...initState, url });
    }

    const img = new Image();

    // Valid image, send to server for processing
    img.onload = async () => {

      document.body.style.setProperty('--imagePreview', `url(${url})`);

      this.ss({ 
        isLoading: false, 
        isProcessing: true, 
        showPreview: true 
      });

      try {
        const response = await axios.post('/images', { remoteImage: url });
        this.ss({ pics: response.data });
      } catch(e) {
        console.error(e);
        this.ss({ 
          error: 'Oops! We could not process that image', 
          showPreview: false 
        });
      }

      this.ss({ isProcessing: false });
    }

    // Invalid image url or some other error
    img.onerror = () => {
      this.ss({ 
        error: 'Could not load image', 
        isLoading: false, 
        showPreview: false 
      });
    }

    this.ss({ 
      error: null, 
      isLoading: true 
    });

    img.src = url;
  }

  componentWillMount = () => {
    this.preCheck = debounce(this.preCheck, DEBOUNCE_DELAY);
  }

  render() {

    const { error, pics, isLoading, isProcessing } = this.state;

    let statusIcon = isLoading || isProcessing ? <LoadingIcon /> : null;
    statusIcon = pics.large ? <CheckIcon width="16px" height="16px" /> : statusIcon;
    statusIcon = error ?  <AlertIcon width="16px" height="16px" /> : statusIcon;

    const statClasses = [];
    if (error) statClasses.push('error');
    if (pics.large) statClasses.push('loaded');
    if (isLoading) statClasses.push('loading');

    return (
      <main className={statClasses.join(' ')}>

        {/* Input */}
        <section>
          <div className="app__input-label-container">
            <label className="app__input-label" htmlFor="imageInput">
              <span style={{ marginRight: '5px' }}>Image URL</span>
              {statusIcon}
            </label>
            <div className="app__status-text">{error}</div>
          </div>

          <div className="app__input-container">
            <input 
              id="imageInput"
              type="text"
              onChange={this.handleInputChange} 
              value={this.state.url} 
              disabled={isProcessing}
              placeholder="Add or paste an image URL here" 
            />
          </div>
        </section>

        {/* Preview */}
        <section className="app__preview-container" ><div /></section>

        {/* Thumbnail Results */}
        <ul className="sizes">
          {Object.keys(pics).map((p, i) => pics[p] ?
            <ThumbItem
              {...pics[p]}
              size={p}
              key={i}
            /> 
            : null
          )}
        </ul>
      </main>
    );
  }
}
