import inquirer from "inquirer";
import bcrypt from "bcrypt";
import chalk from "chalk";
import figlet from "figlet";
// Title decoration
console.log(chalk.yellow(figlet.textSync("Event Management", { horizontalLayout: "full" })));
console.log(chalk.bold.green("Online ticketing System"));
let users = [];
let events = [
    {
        title: "AI and Machine Learning",
        date: "2024-10-01",
        time: "10:00 am",
        city: "Karachi",
        availableTickets: 100,
    },
    {
        title: "Cyber Security",
        date: "2024-10-05",
        time: "11:00 am",
        city: "Islamabad",
        availableTickets: 80,
    },
    {
        title: "Digital Marketing",
        date: "2024-11-01",
        time: "10:00 am",
        city: "Karachi",
        availableTickets: 100,
    },
    {
        title: "Cloud Computing",
        date: "2024-11-04",
        time: "10:00 am",
        city: "Karachi",
        availableTickets: 50,
    },
    {
        title: "Project Management",
        date: "2024-11-18",
        time: "10:00 am",
        city: "Karachi",
        availableTickets: 100,
    },
];
async function main() {
    try {
        while (true) {
            const { role } = await inquirer.prompt({
                name: "role",
                type: "list",
                message: "Are you a user or an admin?",
                choices: ["User", "Admin"],
            });
            if (role === "User") {
                const { action } = await inquirer.prompt({
                    name: "action",
                    type: "list",
                    message: "Do you want to sign up or login?",
                    choices: ["Signup", "Login"],
                });
                if (action === "Signup") {
                    await userSignup();
                }
                else {
                    await userLogin();
                }
            }
            else {
                await adminLogin();
            }
        }
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
}
async function userSignup() {
    const userDetail = await inquirer.prompt([
        {
            name: "username",
            type: "input",
            message: "Enter your name:",
            validate: input => input ? true : "Name cannot be empty",
        },
        {
            name: "email",
            type: "input",
            message: "Enter your email:",
            validate: validateEmail,
        },
        {
            name: "password",
            type: "password",
            message: "Enter your password:",
            validate: validatePassword,
        },
    ]);
    const hashedPassword = await bcrypt.hash(userDetail.password, 10);
    users.push({
        username: userDetail.username,
        email: userDetail.email,
        password: hashedPassword,
        purchasedTickets: [],
    });
    console.log(chalk.green(`Dear ${userDetail.username}, signup successful! Now you can login.`));
    +await userLogin();
}
async function userLogin() {
    const loginDetails = await inquirer.prompt([
        {
            name: "email",
            type: "input",
            message: "Enter your email:",
            validate: validateEmail,
        },
        {
            name: "password",
            type: "password",
            message: "Enter your password:",
            validate: input => input ? true : "Password cannot be empty",
        },
    ]);
    const matchedUser = users.find(user => user.email === loginDetails.email);
    if (matchedUser) {
        const isPasswordValid = await bcrypt.compare(loginDetails.password, matchedUser.password);
        if (isPasswordValid) {
            console.log(chalk.gray(`Welcome back, ${matchedUser.username}!`));
            await userMenu(matchedUser);
        }
        else {
            console.log(chalk.red("Invalid password. Please try again."));
            await userLogin();
        }
    }
    else {
        console.log(chalk.red("No account found with this email. Please sign up."));
        const { signup } = await inquirer.prompt({
            name: "signup",
            type: "confirm",
            message: "Do you want to sign up?",
        });
        if (signup) {
            await userSignup();
        }
        else {
            console.log(chalk.yellow("You chose not to sign up. Exiting."));
        }
    }
}
async function userMenu(user) {
    while (true) {
        const { action } = await inquirer.prompt({
            name: "action",
            type: "list",
            message: "Choose an action:",
            choices: ["View Events", "Purchase Tickets", "View Purchased Tickets", "Logout"],
        });
        if (action === "View Events") {
            await viewEvents(false);
        }
        else if (action === "Purchase Tickets") {
            await purchaseTickets(user);
        }
        else if (action === "View Purchased Tickets") {
            await viewPurchasedTickets(user);
        }
        else if (action === "Logout") {
            console.log(chalk.bold.green("Logging out..."));
            break;
        }
    }
}
async function purchaseTickets(user) {
    const availableEvents = events.filter(event => event.availableTickets > 0);
    const eventNames = availableEvents.map(event => `${event.title} (${event.availableTickets} tickets available)`);
    if (eventNames.length === 0) {
        console.log(chalk.magenta("No events with available tickets."));
        return;
    }
    const { eventSelection } = await inquirer.prompt({
        name: "eventSelection",
        type: "list",
        message: "Select an event to purchase tickets:",
        choices: eventNames,
    });
    const selectedEventIndex = availableEvents.findIndex(event => `${event.title} (${event.availableTickets} tickets available)` === eventSelection);
    const selectedEvent = availableEvents[selectedEventIndex];
    const { ticketCount } = await inquirer.prompt({
        name: "ticketCount",
        type: "number",
        message: `How many tickets do you want to purchase for "${selectedEvent.title}"?`,
        validate: input => {
            if (input <= 0) {
                return "Number of tickets must be greater than zero";
            }
            else if (input > selectedEvent.availableTickets) {
                return `Only ${selectedEvent.availableTickets} tickets are available`;
            }
            return true;
        }
    });
    events[selectedEventIndex].availableTickets -= ticketCount;
    user.purchasedTickets.push({ eventTitle: selectedEvent.title, ticketCount });
    console.log(chalk.greenBright(`You have successfully purchased ${ticketCount} tickets for "${selectedEvent.title}".`));
}
async function viewPurchasedTicket(user) {
    if (user.purchasedTickets.length === 0) {
        console.log(chalk.magenta("You have not purchased any tickets yet."));
    }
    else {
        console.log(chalk.green("Your purchased tickets:"));
        user.purchasedTickets.forEach(ticket => {
            console.log(chalk.yellow(`Event: ${ticket.eventTitle}`));
            console.log(chalk.yellow(`Tickets: ${ticket.ticketCount}`));
            console.log("--------------------");
        });
    }
}
async function adminLogin() {
    const adminLogin = await inquirer.prompt([
        {
            name: "adminEmail",
            type: "input",
            message: "Enter admin email:",
        },
        {
            name: "adminPassword",
            type: "password",
            message: "Enter admin password:",
        },
    ]);
    if (adminLogin.adminEmail === "admin123@gmail.com" && adminLogin.adminPassword === "admin789") {
        console.log(chalk.green("Admin login successful!"));
        await adminMenu();
    }
    else {
        console.log(chalk.red("Invalid credentials entered. Please try again."));
    }
}
async function adminMenu() {
    while (true) {
        const { option } = await inquirer.prompt({
            name: "option",
            type: "list",
            message: "Admin options:",
            choices: ["View Users", "Logout", "Manage Events"],
        });
        if (option === "View Users") {
            console.log(chalk.green("User details:"));
            users.forEach(user => console.log(user));
        }
        else if (option === "Manage Events") {
            await manageEvent();
        }
        else if (option === "Logout") {
            console.log(chalk.green("Logging out..."));
            break;
        }
    }
}
async function manageEvent() {
    while (true) {
        const { eventOption } = await inquirer.prompt({
            name: "eventOption",
            type: "list",
            message: "Event Options:",
            choices: ["Create Event", "Edit Event", "Delete Event", "View Events", "Go Back"],
        });
        switch (eventOption) {
            case "Create Event":
                await createEvent();
                break;
            case "Edit Event":
                await editEvent();
                break;
            case "Delete Event":
                await deleteEvent();
                break;
            case "View Events":
                await viewEvents(true);
                break;
            case "Go Back":
                return;
        }
    }
}
async function createEvent() {
    const eventDetails = await inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "Enter event name:",
            validate: input => input ? true : "Event name cannot be empty",
        },
        {
            name: "date",
            type: "input",
            message: "Enter event date (YYYY-MM-DD):",
            validate: input => validateDate(input),
        },
        {
            name: "time",
            type: "input",
            message: "Enter event time:",
        },
        {
            name: "city",
            type: "input",
            message: "Enter event city:",
        },
        {
            name: "ticketStock",
            type: "number",
            message: "Enter ticket stock:",
        },
    ]);
    events.push({
        title: eventDetails.title,
        date: eventDetails.date,
        time: eventDetails.time,
        city: eventDetails.city,
        availableTickets: eventDetails.ticketStock,
    });
    console.log(chalk.yellow(`Event "${eventDetails.title}" created successfully!`));
}
async function editEvent() {
    const eventNames = events.map(event => event.title);
    if (eventNames.length === 0) {
        console.log("No events found");
        return;
    }
    const { name } = await inquirer.prompt({
        name: "name",
        type: "list",
        message: "Select event to edit:",
        choices: eventNames,
    });
    const eventIndex = events.findIndex(event => event.title === name);
    const eventDetails = await inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "Enter new event name (leave empty to keep current):",
        },
        {
            name: "date",
            type: "input",
            message: "Enter new event date (YYYY-MM-DD) (leave empty to keep current):",
            validate: input => !input || validateDate(input),
        },
        {
            name: "time",
            type: "input",
            message: "Enter new event time (leave empty to keep current):",
        },
        {
            name: "city",
            type: "input",
            message: "Enter new event city (leave empty to keep current):",
        },
        {
            name: "ticketStock",
            type: "number",
            message: "Enter new ticket stock (leave empty to keep current):",
        },
    ]);
    const event = events[eventIndex];
    if (eventDetails.title)
        event.title = eventDetails.title;
    if (eventDetails.date)
        event.date = eventDetails.date;
    if (eventDetails.time)
        event.time = eventDetails.time;
    if (eventDetails.city)
        event.city = eventDetails.city;
    if (eventDetails.ticketStock !== undefined)
        event.availableTickets = eventDetails.ticketStock;
    console.log(chalk.yellow(`Event "${event.title}" updated successfully!`));
}
async function deleteEvent() {
    const eventNames = events.map(event => event.title);
    if (eventNames.length === 0) {
        console.log(chalk.magenta("No events found"));
        return;
    }
    const { name } = await inquirer.prompt({
        name: "name",
        type: "list",
        message: "Select event to delete:",
        choices: eventNames,
    });
    const eventIndex = events.findIndex(event => event.title === name);
    events.splice(eventIndex, 1);
    console.log(chalk.magenta(`Event "${name}" deleted successfully!`));
}
async function viewEvents(adminView) {
    const availableEvents = events.filter(event => event.availableTickets > 0);
    const eventsToDisplay = adminView ? events : availableEvents;
    if (eventsToDisplay.length === 0) {
        console.log(chalk.magenta("No events available."));
    }
    else {
        console.log(chalk.green("Events:"));
        eventsToDisplay.forEach(event => {
            console.log(chalk.yellow(`Name: ${event.title}`));
            console.log(chalk.yellow(`Date: ${event.date}`));
            console.log(chalk.yellow(`Time: ${event.time}`));
            console.log(chalk.yellow(`City: ${event.city}`));
            console.log(chalk.yellow(`Available Tickets: ${event.availableTickets}`));
            console.log("--------------------");
        });
    }
}
async function viewPurchasedTickets(user) {
    if (user.purchasedTickets.length === 0) {
        console.log(chalk.magenta("You have not purchased any tickets yet."));
    }
    else {
        console.log(chalk.green("Your purchased tickets:"));
        user.purchasedTickets.forEach(ticket => {
            console.log(chalk.green(`Event: ${ticket.eventTitle}`));
            console.log(chalk.yellow(`Tickets: ${ticket.ticketCount}`));
            console.log("--------------------");
        });
    }
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? true : "Invalid email format";
}
function validatePassword(password) {
    return password.length >= 6 ? true : "Password must be at least 6 characters long";
}
function validateDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date) ? true : "Invalid date format (YYYY-MM-DD)";
}
main();
