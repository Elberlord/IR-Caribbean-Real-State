# I&R Caribbean Real Estate

Static real estate website ready for GitHub Pages.

## What is included

- `index.html` → premium homepage
- `properties.html` → dedicated properties page
- `manage-properties.html` → local property manager for adding/editing listings
- `styles.css` → shared styling
- `script.js` → shared config and helpers
- `properties.js` → properties page filters and rendering
- `admin.js` → local admin workflow
- `data/properties.json` → sample property data

## Important honesty note

This project is designed for **GitHub Pages**, which is a static hosting service.
That means the public site **cannot save new properties directly online by itself** unless you add a backend or an external CMS.

The workflow included here is the clean static-site approach:

1. Open `manage-properties.html`
2. Add or edit listings locally in your browser
3. Click **Export JSON**
4. Replace `data/properties.json` in your GitHub repository with the exported file
5. Push changes to GitHub

Once you push, the public `properties.html` page updates.

## Contact configuration

Open `script.js` and replace these values:

```js
const CONFIG = {
  companyName: 'I&R Caribbean Real Estate',
  whatsappNumber: '10000000000',
  whatsappDisplay: '+1 000 000 0000',
  whatsappMessage: 'Hello, I would like information about your properties.',
  email: 'info@yourdomain.com',
  emailSubject: 'Property inquiry',
  emailBody: 'Hello, I would like more information about your properties.'
};
```

## Publish to GitHub Pages

1. Create a GitHub repository
2. Upload all files keeping the same structure
3. Go to **Settings > Pages**
4. Under **Build and deployment**, choose **Deploy from a branch**
5. Select your main branch and the root folder
6. Save

Your site will publish on the GitHub Pages URL.

## Possible next upgrade

If later you want true online property management without touching JSON manually, the next logical step is connecting this front end to:

- Supabase
- Firebase
- Airtable
- A small custom backend

That would let you add properties from a real admin panel and publish instantly.
