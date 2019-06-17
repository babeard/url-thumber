import React, { Component } from 'react';
import axios from "axios";
import classnames from "classnames";

import debounce from "./utils/debounce";

import LoadingIcon from "./components/svg/loadingIcon";
import AlertIcon from "./components/svg/alertIcon";
import CheckIcon from './components/svg/checkIcon';
import ThumbItems from './components/thumbItems';

const DEBOUNCE_DELAY = 400; // milliseconds

const initState = {
  isLoading: false,
  isProcessing: false,
  showPreview: false,
  pics: {
    // small: { type: 'png', url: 'http://i.imgur.com/i5E1fJx.png' },
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

      this.setState({ ...this.state, isLoading: false, isProcessing: true, showPreview: true });
      
      try {
        // const response = await axios.post('/images', { remoteImage: url });
        // this.setState({ ...this.state, pics: response.data });
        this.setState({ ...this.state, pics: { ...this.state.pics, large: { type: 'png', url: 'http://i.imgur.com/i5E1fJx.png' }} });
        
      } catch(e) {
        console.error(e);
        this.setState({ ...this.state, error: 'Oops! We could not process that image', showPreview: false });
      }

      this.setState({ ...this.state, isProcessing: false });

    }

    // Invalid image url or some other error
    img.onerror = () => {
      this.setState({ ...this.state, error: 'Could not load image', isLoading: false, showPreview: false });
    }

    this.setState({ ...this.state, error: null, isLoading: true });
    img.src = url;
  }

  componentWillMount = () => {
    this.preCheck = debounce(this.preCheck, DEBOUNCE_DELAY);
  }

  handleClick = () => {
    console.log(this.state.url)
  }

  render() {
    
    const { error, pics, isLoading, isProcessing } = this.state;

    let statusIcon = isLoading ? <LoadingIcon /> : null;
    statusIcon = pics.large ? <CheckIcon width="16px" height="16px" /> : statusIcon;
    statusIcon = error ?  <AlertIcon width="16px" height="16px" /> : statusIcon;

    const boxClasses = classnames({
      'box': true,
      'error': error,
      'loaded': pics.large,
      'loading': isLoading
    });

    return (
      <main>
        <div className={boxClasses} >
          <section>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <label htmlFor="imgUrl">
                <span style={{ marginRight: '5px' }}>Image URL</span>
                {statusIcon}
              </label>
              <div style={{ color: '#A0AEC0', fontStyle: 'italic', fontSize: '0.8rem'}}>{error}</div>
            </div>

            <div className="input-container">
              <input id="imgUrl" disabled={isProcessing} type="text" placeholder="Add or paste an image URL here" onChange={this.handleInputChange} value={this.state.url} />
            </div>
          </section>


          <section style={{ display: 'flex', justifyContent: 'center' }} >
            <div className={`preview-pic ${this.state.showPreview ? 'active' : ''}`}></div>
          </section>

          <ul className="sizes">
            {Object.keys(pics).map((p, i) => pics[p] ? <ThumbItems size={p} url={pics[p].url} type={pics[p].type} key={i} /> : null)}
          </ul>
        </div>
      </main>
    );
  }
}
