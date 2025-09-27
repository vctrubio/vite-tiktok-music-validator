# Event Listener on Tik Tok Users

- aim is to create a db that stores users, checks their post, and sees the STATUS of the Song (if any)
- use aritable for db
- use primerApi for queriing tiktok

1. add username, to get secuid - store in a table
2. with secuid, we can query user's post
3. check if post has song, if has song create new song row
4. song row will keep track of the user, (to notify if song is no longer available on tiktok MUSIC)
5. call a webhook every X hours to see updates,

- idea is to inform the user that the song is no longer available, if status changes.
