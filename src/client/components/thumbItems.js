import React from "react";

import DownloadIcon from "./svg/downloadIcon";

export default ({url, size, type}) => {
  return (
    <li>
      <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
        <div className="title">Size</div>
        <a 
          href={url} 
          className="info"
          target="__blank" 
          title={`Download image: ${url}`}
          download
        >{size}</a>
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