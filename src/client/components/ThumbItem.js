import React from "react";

import DownloadIcon from "./svg/DownloadIcon";
import humanFileSize from "../utils/humanFileSize";

export default ({url, size, filesize, dimensions, type}) => {
  return (
    <li>
      <a href={url} target="__blank" title={`Download image: ${url}`}>
        <img src={ url } width="50px" style={{ borderRadius: '50%', marginRight: '15px'}} />
      </a>
      <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
        <div className="title">Thumb</div>
        <a 
          href={url} 
          className="info"
          target="__blank" 
          title={`Download image: ${url}`}
        >{size}</a>
      </div>

      <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
        <div className="title">Dimensions</div>
        <span className="info" style={{ textTransform: 'lowercase'}}>{`${dimensions[0]}x${dimensions[1]}`}</span>
      </div>

      <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
        <div className="title">Size</div>
        <a
          href={url}
          className="info"
          target="__blank"
          title={`Download image: ${url}`}
        >{humanFileSize(filesize)}</a>
      </div>
      
      <a
        href={url}
        className="info"
        target="__blank"
        title={ `Download image: ${url}`}
        download={ `${size}.${type}`}
      ><DownloadIcon width="24px" height="24px" /></a>
    </li>
  );
}