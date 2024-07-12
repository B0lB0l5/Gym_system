# Gym_system

This is a simple Gym Management System built with Express.js and Moment.js. The system handles CRUD operations for members and trainers, checks for membership validity, and handles soft deletion of members. Data is stored in JSON files.

## Features

- **Members API:**
  - Get a member by ID
  - Get all members
  - Add a new member
  - Update a member
  - Delete a member (hard and soft delete)
  - Get member revenues

- **Trainers API:**
  - Get a trainer by ID
  - Get all trainers
  - Add a new trainer
  - Update a trainer
  - Delete a trainer
  - Get trainer revenues

## Endpoints

### Members API

- `GET /members/:id`
  - Retrieves a member by ID.
  
- `GET /members`
  - Retrieves all members.
  
- `POST /members`
  - Adds a new member.
  
- `PUT /members/:id`
  - Updates a member by ID.
  
- `DELETE /members`
  - Deletes all members.
  
- `DELETE /members/:id`
  - Soft deletes a member by ID.

### Trainers API

- `GET /trainers/:id`
  - Retrieves a trainer by ID.
  
- `GET /trainers`
  - Retrieves all trainers.
  
- `POST /trainers`
  - Adds a new trainer.
  
- `PUT /trainers/:id`
  - Updates a trainer by ID.
  
- `DELETE /trainers`
  - Deletes all trainers.
  
- `DELETE /trainers/:id`
  - Deletes a trainer by ID.

### Statistics API

- `GET /revenues`
  - Retrieves total revenue from all members.
  
- `GET /trainers/revenues/:id`
  - Retrieves total revenue for a specific trainer by ID.

## Data Storage

- Members data is stored in `members.json`.
- Trainers data is stored in `trainers.json`.

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gym-management-system.git
