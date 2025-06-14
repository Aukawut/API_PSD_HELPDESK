# Use official Node.js 18 base image
FROM node:18

# Set environment variables
ENV JWT_SECRET=jwt_secret_\$\@!
ENV PORT=8081
ENV DB_USER=helpdesk
ENV DB_PWD=helpdesk@2018
ENV DB_NAME=DB_PSDHELPDESK
ENV DB_HOST=10.144.1.113
ENV ENVIRONMENT=Development
ENV SMTP_SERVER=10.145.0.250
ENV SMTP_ACCOUNT=it-system@prospira.local
ENV SMTP_PASSWORD=Psth@min135
ENV SMTP_PORT=25
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE $PORT

# Command to run the application
CMD ["node", "route.js"]
