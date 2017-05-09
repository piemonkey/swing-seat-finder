# Swing Seat Finder

A quick experiment to play with data.parliament.uk data to show the nearest parliamentary constituencies to people so they can find the nearest seat which is likely to swing and so the most fruitful for persuading voters to switch.

## Data

Data stored [in this repo](data/hocl-ge2015-results-summary.csv) comes from [data.parliament.uk](http://www.data.parliament.uk/) under the [Open Parliament Licence v3.0](https://www.parliament.uk/site-information/copyright/open-parliament-licence/).

[Map It](https://mapit.mysociety.org/) is also used to retreive constituency data. The details of the license are [on their website](https://mapit.mysociety.org/legal/). Ideally all requests would be made using an API key, but since this site doesn't have a back-end, it was easier to default, free tier. This might have the side-effect that anyone using the site is agreeing to their terms and conditions.
