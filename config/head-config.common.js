/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 * Example:
 * { name: 'msapplication-TileImage', content: '/assets/icon/ms-icon-144x144.png', '=content': true },
 * Will prefix the publicPath to content.
 *
 * { rel: 'apple-touch-icon', sizes: '57x57', href: '/assets/icon/apple-icon-57x57.png', '=href': false },
 * Will not prefix the publicPath on href (href attributes are added by default
 *
 */
module.exports = {
  link: [
    /** <link> tags for 'apple-touch-icon' (AKA Web Clips). **/
    {
      rel: 'apple-touch-icon',
      href: '/assets/icon/apple-touch-icon.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '76x76',
      href: '/assets/icon/apple-touch-icon-76x76.png'
    },
    { rel: 'apple-touch-icon',
      sizes: '120x120',
      href: '/assets/icon/apple-touch-icon-120x120.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '152x152',
      href: '/assets/icon/apple-touch-icon-152x152.png'
    },

    /** <link> tags for normal icon **/
    {
      rel: 'icon',
      sizes: '128x128',
      href: '/assets/icon/icon-normal.png'
    },

     /** <link> tag for cross browser favicon **/
     {
      rel: 'shortcut icon',
      type: 'image/x-icon',
      href: '/assets/icon/icon-normal.png'
    },

    /** <link> tags for a Web App Manifest (for android) **/
    {
      rel: 'manifest',
      href: '/assets/manifest.json'
    }
  ],
  meta: [
    {
      name: 'msapplication-TileColor',
      content: '#00bcd4'
    },
    {
      name: 'msapplication-TileImage',
      content: '/assets/icon/cropped-macquarie-circles-270x270.png', '=content': true
    }
  ]
};
