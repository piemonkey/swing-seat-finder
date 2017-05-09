'use strict'

const PARTIES = ['con','lab','ld','ukip','green','snp','pc','dup','sf','sdlp','uup','alliance','other']

var voteData

// Populate Vote data from csv
fetch('data/hocl-ge2015-results-summary.csv')
  .then(function(res) {
    return res.text()
  })
  .then(function(data) {
    const rows = data.split('\n')
    const headers = rows.shift().split(',')
    voteData = {}
    rows.forEach(function(row) {
      // Catch any empty lines
      if (row) {
        // Replace any commas within quotes with a placeholder
        const commaStripped = row.replace(/"(.*)"/g, function(_, quoted) { return quoted.replace(',', '|') })
        const cols = commaStripped.split(',')
        const constituency = {}
        headers.forEach(function(header, index) {
          constituency[header] = cols[index]
        })
        // Unhack name
        constituency.constituency_name = constituency.constituency_name.replace('|', ',')
        voteData[constituency.constituency_name] = constituency
      }
    })
  })
  .catch(console.error)

function formatPercent(number) {
  return (number * 100).toFixed(2) + '%'
}

function lookup(event) {
  event.preventDefault()
  if (event.target[0].name === 'postcode') {
    let localConstituencies
    fetch('https://mapit.mysociety.org/postcode/' + event.target[0].value, { mode: 'cors' })
      .then(function(res) { return res.json() })
      .then(function(data) {
        localConstituencies = Object.keys(data.areas)
          .map(function(id) { return data.areas[id] })
          .filter(function(area) { return area.type === 'WMC' })
        return Promise.all(localConstituencies.map(function(constituency) {
          return fetch('https://mapit.mysociety.org/area/' + constituency.id + '/touches?type=WMC')
        }))
      })
      .then(function(results) { return Promise.all(results.map(function(res) { return res.json() })) })
      .then(function(nearbyAreaData) {
        const nearbyAreas = nearbyAreaData
          // pull each set of data into its own array
          .map(function(data) { return Object.keys(data).map(function(id) { return data[id] }) })
          // put them together into one
          .reduce(function(first, second) { return first.concat(second) }, [])
        localConstituencies = localConstituencies.concat(nearbyAreas)

        const constituencyVoteData = localConstituencies.map(function(consts) { return voteData[consts.name] })

        const resTable = document.getElementById('results')
        // Remove old data
        if (resTable.rows.length > 1) {
          for (let i = resTable.rows.length - 1; i > 0; i--) {
            resTable.deleteRow(i)
          }
        }
        // Populate new data
        constituencyVoteData.forEach(function(constituency) {
          if (!constituency) return
          const resRow = resTable.insertRow()
          const totalVotes = constituency.valid_votes
          resRow.insertCell().appendChild(document.createTextNode(constituency.constituency_name))
          resRow.insertCell().appendChild(document.createTextNode(constituency.first_party))
          resRow.insertCell().appendChild(document.createTextNode(totalVotes))
          resRow.insertCell().appendChild(document.createTextNode(formatPercent(totalVotes / constituency.electorate)))
          resRow.insertCell().appendChild(document.createTextNode(formatPercent(constituency.majority / totalVotes)))
          const descParties = PARTIES
            .map(function(party) { return [party, constituency[party]] })
            .sort(function(first, second) { return second[1] - first[1] })
          resRow.insertCell().appendChild(document.createTextNode(descParties[1][0] + ': ' + formatPercent(descParties[1][1] / totalVotes)))
          resRow.insertCell().appendChild(document.createTextNode(descParties[2][0] + ': ' + formatPercent(descParties[2][1] / totalVotes)))
        })

        resTable.setAttribute('style', '')
      })
      .catch(console.error)
  }
}
