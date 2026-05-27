import React from 'react';
import Helmet from 'react-helmet';

function SEO(props) {

  return (
    <Helmet>
      <title>{props.title}</title>
      <meta property="og:title" content={props.title} />
      <meta property="og:image" content={props.thumbnail} />
      <meta property="og:type" content='website' />
      <meta property="og:url" content={props.url} />
      <meta property="og:description" content={props.description}/>
    </Helmet>    
  )
}

export default SEO;