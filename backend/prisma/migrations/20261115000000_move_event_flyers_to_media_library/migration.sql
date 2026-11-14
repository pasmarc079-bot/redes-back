-- The event flyers now live in the media library (Cloudinary), so the admin can replace them
-- like any other image. They used to be static files shipped with the frontend, which the site
-- could not change and which weighed several megabytes each.
UPDATE events
SET flyer_url = 'https://res.cloudinary.com/lswvtj4t/image/upload/f_auto,q_auto,w_1600/v1794693180/redes-media/fuqtzh4e2necbadmnhqa.jpg'
WHERE slug = 'un-legado-de-amor-para-la-familia';

UPDATE events
SET flyer_url = 'https://res.cloudinary.com/lswvtj4t/image/upload/f_auto,q_auto,w_1200/v1794693193/redes-media/xtzghurh6nbffnux9y8k.jpg'
WHERE slug = 'exaltando-al-padre-2026';
