'use strict'

const PARTIES = [
  'con',
  'lab',
  'ld',
  'ukip',
  'green',
  'snp',
  'pc',
  'dup',
  'sf',
  'sdlp',
  'uup',
  'alliance',
  'other'
]

var constituencies

fetch('data/hocl-ge2015-results-summary.csv')
.then(function(res) {
  return res.text()
})
.then(function(data) {
  const rows = data.split('\n')
  const headers = rows.shift().split(',')
  constituencies = rows.map(function(row) {
    // Replace any commas within quotes with a placeholder
    const commaStripped = row.replace(/"(.*)"/g, function(_, quoted) { return quoted.replace(',', '|') })
    const cols = commaStripped.split(',')
    const constituency = {}
    headers.forEach(function(header, index) {
      constituency[header] = cols[index]
    })
    return constituency
  })
})
.catch(console.error)

function percent(number) {
  return (number * 10).toFixed(2) + '%'
}

function lookup(event) {
  event.preventDefault()
  if (event.target[0].name === 'postcode') {
    fetch('https://mapit.mysociety.org/postcode/' + event.target[0].value, { mode: 'cors' })
    .then(function(res) { return res.json() })
    .then(function(data) {
      const constsInPostcode = Object.keys(data.areas)
        .map(function(id) { return data.areas[id] })
        .filter(function(area) { return area.type === 'WMC' })
      const constituency = constituencies.filter(function(constit) { return constit.constituency_name === constsInPostcode[0].name })[0]
      const resTable = document.getElementById('results')
      const resRow = resTable.insertRow()
      const totalVotes = constituency.valid_votes
      resRow.insertCell().appendChild(document.createTextNode(constituency.constituency_name))
      resRow.insertCell().appendChild(document.createTextNode(constituency.first_party))
      resRow.insertCell().appendChild(document.createTextNode(totalVotes))
      resRow.insertCell().appendChild(document.createTextNode(percent(totalVotes / constituency.electorate)))
      resRow.insertCell().appendChild(document.createTextNode(percent(constituency.majority / totalVotes)))
      const descParties = PARTIES
        .map(function(party) { return [party, constituency[party]] })
        .sort(function(first, second) { return second[1] - first[1] })
      resRow.insertCell().appendChild(document.createTextNode(descParties[1][0] + ': ' + percent(descParties[1][1] / totalVotes)))
      resRow.insertCell().appendChild(document.createTextNode(descParties[2][0] + ': ' + percent(descParties[2][1] / totalVotes)))

      resTable.setAttribute('style', '')
    })
    .catch(console.error)
  }
}
