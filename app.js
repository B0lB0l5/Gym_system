const express = require('express')
const moment = require('moment')
const fs = require('fs')
const app = express()
const port = 8383

let members = JSON.parse(fs.readFileSync('./members.json'))
let trainers = JSON.parse(fs.readFileSync('./trainers.json'))

app.use(express.json())

//members APIs
const findMember = (req, res, next) => {
    const member = members.find(member => member.id == req.params.id)
    if (!member) 
        return res.status(404).json({ message: 'Member not found' })

    req.member = member
    next()
}

// GET members method
app.get('/members/:id', findMember, (req, res) => {
    const currentDate = moment()
    const membershipEndDate = moment(req.member.memberShip.to, "MMM D YY")  
    
    if (currentDate.isAfter(membershipEndDate)) 
        return res.status(403).json({ message: 'This member is not allowed to enter the gym, Membership expired', member: req.member })
    else 
        res.status(200).json({message: 'This member is allowed to enter the gym', member: req.member})
})

app.get('/members', (req, res) => {
    const members_Trainers = members.map(member => {
        const memberTrainer = trainers.find(trainer => trainer.id == member.trainerId)
        return { ...member, trainer: memberTrainer }
    })

    if(req.query.info == 'all')
        members == 0 ? res.status(200).json({ message:"there no members to show"}) : res.status(200).json(members_Trainers)
    
    const activeMembers = members.filter(member => !member.deletionStatus)
    
    if(Object.keys(req.query).length == 0 )
        members == 0 ? res.status(200).json({ message:"there no members to show"}) : res.status(200).json(activeMembers)
    
    if(req.query.info == 'soft')
        members == 0 ? res.status(200).json({ message:"there no members to show"}) : res.status(200).json(members)
})

// POST members method
app.post('/members', (req, res) => {
    const membershipPackages = {
        1: { days: 30, cost: 800 },
        2: { days: 60, cost: 1500 },
        3: { days: 90, cost: 2000 }
    }

    const { packageId, name, nationalId,  phoneNumber,  trainerId } = req.body

    
    const errors = []
    if (!membershipPackages[packageId]) 
        return res.status(400).json({ message: 'Invalid package ID' })
    
    const notUnique = members.some(member => {
        if (member.nationalId == nationalId) 
            errors.push('National ID already exists')
        
        if (member.name == name) 
            errors.push('Name already exists')
        
        if (member.phoneNumber == phoneNumber) 
            errors.push('Phone number already exists')
        
        return errors.length > 0
    })
    errors.push('2nta kda 7aramy yasta da5al bayanat 7a2e2ya')

    if (notUnique) 
        return res.status(400).json({ message: errors.join(', ') })
    
    const memberId = members.length == 0 ? 1 : members[members.length -1].id + 1
    const packageDetails = membershipPackages[packageId]
    const From = moment().format("MMM D YY")
    const To = moment().add(packageDetails.days, 'days').format("MMM D YY")

    const newMember = {
        id: memberId,
        name: name,
        nationalId: nationalId,
        phoneNumber: phoneNumber,
        memberShip: {
            cost: packageDetails.cost,
            from: From,
            to: To
        },
        TrainerId: trainerId
    }

    members.push(newMember)
    fs.writeFileSync("./members.json", JSON.stringify(members))
    res.status(201).json({ message: "Member added successfully", member: newMember })
})

// PUT method
app.put('/members/:id', findMember, (req, res) => {
    const index = members.findIndex(member => member.id == req.params.id)
    if(index == -1)
        res.status(400).json({message: 'Member not found to update'})
    else{
        members[index].name = req.body.name
        members[index].trainerId = req.body.trainerId
        members[index].memberShip = req.body.memberShip
        
        fs.writeFileSync('./members.json', JSON.stringify(members))
        res.status(201).json({message: 'Member updated successfully'})
    }
})

// DELETE members method
app.delete('/members', (req, res) => {
    members.length = 0 

    fs.writeFileSync('./members.json', JSON.stringify(members))
    res.status(201).json({message: 'deleted'})
})

app.delete('/members/:id', (req, res) => {
    const memberIndex = members.findIndex(member => member.id == req.params.id)

    if (memberIndex == -1) 
        return res.status(404).json({ message: 'Member not found to delete' })
    
    const member = members[memberIndex]
    const currentDate = moment()
    const membershipEndDate = moment(member.memberShip.to, "MMM D YY")

    if(member.deletionStatus == true)
        return res.status(200).json({ message: "Member already soft deleted" })

    if (currentDate.isAfter(membershipEndDate)) {
        member.deletionStatus = true
        member.status = "expired"
        fs.writeFileSync("./members.json", JSON.stringify(members))
        return res.status(200).json({ message: "Member soft deleted successfully" })
    } 
    else 
        return res.status(400).json({ message: 'Membership is still active or frozen' })
})

////////////////////////////////////////////////////////////////////////////////////////////

//trainers APIs

const findTrainer = (req, res, next) => {
    const trainer = trainers.find(trainer => trainer.id == req.params.id)
    if (!trainer) 
        return res.status(404).json({ message: 'Trainer not found' })
    
    req.trainer = trainer
    next()
}

// GET trainers method
app.get('/trainers/:id', findTrainer, (req, res) => {
    const index = trainers.findIndex((trainer) => trainer.id == req.params.id)
        const trainerMembers = members.filter(member => member.trainerId == req.trainer.id)
        const trainer_Members = { ...req.trainer, members: trainerMembers }
        if(req.query.info == 'all')
            res.status(200).json(trainer_Members)

        if(Object.keys(req.query).length == 0)
            res.status(200).json(trainers[index])
})

app.get('/trainers', (req, res) => {
    const trainers_Members = trainers.map(trainer => {
        const trainerMembers = members.filter(member => member.trainerId == trainer.id)
        return { ...trainer, members: trainerMembers }
    })
    if(req.query.info == 'all')
        res.status(200).json(trainers_Members)
        
    if(Object.keys(req.query).length == 0 )
        res.status(200).json(trainers)

})

// POST trainers method
app.post('/trainers', (req, res) => {
    req.body.id =  trainers.length == 0 ? 1 : trainers[trainers.length -1].id + 1
    trainers.push(req.body)
    fs.writeFileSync('./trainers.json', JSON.stringify(trainers))
    res.status(201).json({message: 'trainer added'})
})

// PUT trainers method 
app.put('/trainers/:id', findTrainer, (req, res) => {
    const index = trainers.findIndex((trainer) => trainer.id == req.params.id)
    if (index === -1) 
        return res.status(404).json({ message: 'Trainer not found to update' });

    trainers[index] = {
        ...trainers[index],
        ...req.body
    }

    fs.writeFileSync('./trainers.json', JSON.stringify(trainers))
    res.status(200).json({message: 'updated', trainer : req.body})
})

// DELETE trainers method
app.delete('/trainers', (req, res) => {

    trainers.length = 0 
    fs.writeFileSync('./trainers.json', JSON.stringify(trainers))
    res.status(201).json({message: 'deleted'})
})

app.delete('/trainers/:id', (req, res) => {
    const index = trainers.findIndex((trainer) => trainer.id == req.params.id)
    if(index == -1)
        res.status(404).json({message: 'Trainer not found to delete'})
    else{
        trainers.splice(index, 1)
        fs.writeFileSync('./trainers.json', JSON.stringify(trainers))
        res.status(201).json({message: 'deleted'})
    }
})

////////////////////////////////////////////////////////////////////////////////////////////

//statistics APIs
//members revenues

app.get('/revenues', (req, res) => {
    const totalRevenue = 0
    members.forEach(member => {
        totalRevenue += member.memberShip.cost
    })
    res.status(200).json({ totalRevenue: totalRevenue })
})

//trainers revenues
app.get('/trainers/revenues/:id', (req, res) => {
    const trainer = trainers.find(trainer => trainer.id == req.params.id)
    if (!trainer) 
        return res.status(404).json({ message: 'Trainer not found' })

    else {
    const trainerMembers = members.filter(member => member.TrainerId == req.params.id)
    let totalRevenue = 0
    trainerMembers.forEach(member => {
        totalRevenue += member.memberShip.cost
    })
    res.status(200).json({ trainer: trainer.name, totalRevenue: totalRevenue })
    }
})

app.get('*', (req, res) => {
    res.status(404).json({message: 'not found'})
})

app.listen(port, () => console.log(`app is running on port ${port}...`))
