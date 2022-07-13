const express = require('express')
const { readFile } = require('fs')
const morgan = require('morgan')
var path = require('path')

require('dotenv').config()
const Person = require('./models/person')

const app = express()

morgan.token('newperson', (request) => {
  return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :newperson'))
app.use(express.json())
app.use(express.static('build'))

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) { response.json(person) } else { response.status(404).end() }
  })
    .catch(error => next(error))
})

app.get('/', (request, response) => {
  const filelink = path.join(__dirname, 'build', 'index.html')
  response.send(readFile(filelink, (err) => {
    if (err) console.log('error', err)
  }))
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${new Date()}</p>`)
  })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const newperson = new Person({
    name: request.body.name,
    number: request.body.number,
    id: Math.floor(Math.random() * 10000),
  })
  newperson.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {

  const newperson = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id, newperson, {
    runValidators: true,
    context: 'query',
    new: true,
  })
    .then((updatedPerson) => { response.json(updatedPerson) })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => { response.status(204).end() })
    .catch(error => next(error))
})

morgan.token('param', function (req) {
  console.log(req.param)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') { return response.status(400).send({ error: 'malformatted id' }) }
  else if (error.name === 'ValidationError') { return response.status(400).json({ error: error.message }) }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})