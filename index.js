const express = require('express')
const { readFile, readFileSync } = require('fs')
const morgan = require('morgan')

const app = express()

morgan.token("newperson", (request, response) => {
  return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :newperson'))
app.use(express.json())
app.use(express.static('build'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) { response.json(person) } else { response.status(404).end() }
})

app.get('/', (request, response) => {
  response.send(readFileSync('/build/index.html'))
})

app.get('/info', (request, response) => {
  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (persons.find(p => p.name == person.name)) {
    response.status(404).json({ error: 'name must be unique' })
  }
  else if (person.name == null || person.number == null) {
    response.status(404).json({ error: `no name / number` })
  }
  else {
    person.id = Math.floor(Math.random() * 10000)
    persons = persons.concat(person)
    response.json(person)
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

morgan.token('param', function (req, res) {
  console.log(req.param, person);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})