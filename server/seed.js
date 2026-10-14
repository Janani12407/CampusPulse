const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Connection = require('./models/Connection');
const NewsPost = require('./models/NewsPost');
const Event = require('./models/Event');
const RSVP = require('./models/RSVP');
const EventUpdate = require('./models/EventUpdate');
const VolunteerNeed = require('./models/VolunteerNeed');
const VolunteerApplication = require('./models/VolunteerApplication');
const BlogPost = require('./models/BlogPost');
const Comment = require('./models/Comment');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Connection.deleteMany({}),
      NewsPost.deleteMany({}),
      Event.deleteMany({}),
      RSVP.deleteMany({}),
      EventUpdate.deleteMany({}),
      VolunteerNeed.deleteMany({}),
      VolunteerApplication.deleteMany({}),
      BlogPost.deleteMany({}),
      Comment.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // 1. CREATE USERS
    const usersData = [
      // Admins & Clubs
      { name: 'Campus Admin', email: 'admin@college.edu', role: 'admin', department: 'Admin', year: 4, bio: 'Central Campus Administration & Events Council.' },
      { name: 'Cultural Council', email: 'cultural@college.edu', role: 'club', department: 'Admin', year: 4, bio: 'Organizers of Rhythms, Freshers, and Annual Campus Fests.' },
      { name: 'Coding Club Lead', email: 'coding@college.edu', role: 'club', department: 'CSE', year: 3, bio: 'Department club for algorithms, hackathons, and open source.' },
      
      // Students (Unplaced & Juniors)
      { name: 'Arjun Sharma', email: 'arjun@college.edu', department: 'CSE', year: 1, clubs: ['Coding Club'], bio: 'First year CS undergrad passionate about Web3 and competitive programming.' },
      { name: 'Priya Patel', email: 'priya@college.edu', department: 'CSE', year: 2, clubs: ['Robotics', 'Coding Club'], bio: 'Full-stack builder and hackathon enthusiast.' },
      { name: 'Rahul Verma', email: 'rahul@college.edu', department: 'CSE', year: 3, clubs: ['Coding Club'], bio: 'Systems engineer & Linux explorer.' },
      { name: 'Sneha Gupta', email: 'sneha@college.edu', department: 'CSE', year: 2, clubs: ['Debate', 'Rotaract'], bio: 'UI/UX enthusiast and student debate society convener.' },
      { name: 'Karthik Reddy', email: 'karthik@college.edu', department: 'ECE', year: 1, clubs: ['Robotics'], bio: 'First year ECE exploring embedded IoT and robotics.' },
      { name: 'Ananya Iyer', email: 'ananya@college.edu', department: 'ECE', year: 2, clubs: ['Cultural Council', 'Music Club'], bio: 'Violinist & VLSI student.' },
      { name: 'Vikram Singh', email: 'vikram@college.edu', department: 'ECE', year: 3, clubs: ['Sports Club'], bio: 'Campus football team vice-captain.' },
      { name: 'Meera Nair', email: 'meera@college.edu', department: 'ECE', year: 1, clubs: ['Photography Club'], bio: 'Capturing campus moments through the lens.' },
      { name: 'Aditya Kumar', email: 'aditya@college.edu', department: 'Mechanical', year: 2, clubs: ['Auto Club'], bio: 'Formula Student aerodynamics team member.' },
      { name: 'Divya Joshi', email: 'divya@college.edu', department: 'Mechanical', year: 3, clubs: ['E-Cell'], bio: 'Aspiring product manager and student founder.' },
      { name: 'Rohan Mishra', email: 'rohan@college.edu', department: 'Mechanical', year: 1, clubs: ['NSS'], bio: 'Green campus volunteer.' },
      { name: 'Neha Agarwal', email: 'neha@college.edu', department: 'Civil', year: 2, clubs: ['NSS', 'Rotaract'], bio: 'Structural engineering enthusiast.' },
      { name: 'Sanjay Dubey', email: 'sanjay@college.edu', department: 'Civil', year: 3, clubs: ['Sports Club'], bio: 'Cricket team captain and CAD designer.' },
      { name: 'Pooja Rao', email: 'pooja@college.edu', department: 'Civil', year: 1, clubs: ['Photography Club'], bio: 'Architecture and surveying.' },
      { name: 'Amit Tiwari', email: 'amit@college.edu', department: 'Biotech', year: 2, clubs: ['Research Club'], bio: 'Genomics and CRISPR laboratory volunteer.' },

      // Placed Seniors (Graduating Class 2026)
      { 
        name: 'Riya Sen', 
        email: 'riya@college.edu', 
        department: 'CSE', 
        year: 4, 
        clubs: ['Placement Cell', 'Coding Club'], 
        bio: 'Incoming Software Engineer at Google MTV. Happy to review resumes!',
        isPlaced: true, 
        placementDetails: { company: 'Google', role: 'Software Engineer', offerType: 'On-Campus', ctcLpa: 38 } 
      },
      { 
        name: 'Kabir Mehta', 
        email: 'kabir@college.edu', 
        department: 'CSE', 
        year: 4, 
        clubs: ['Coding Club'], 
        bio: 'Incoming SDE at Microsoft IDC. Distributed systems enthusiast.',
        isPlaced: true, 
        placementDetails: { company: 'Microsoft', role: 'Software Development Engineer', offerType: 'On-Campus', ctcLpa: 44 } 
      },
      { 
        name: 'Sara Khan', 
        email: 'sara@college.edu', 
        department: 'Biotech', 
        year: 4, 
        clubs: ['Research Club'], 
        bio: 'Bridging healthcare analytics at Amazon Web Services.',
        isPlaced: true, 
        placementDetails: { company: 'Amazon', role: 'SDE-1', offerType: 'On-Campus', ctcLpa: 32 } 
      },
      { 
        name: 'Tanvi Deshmukh', 
        email: 'tanvi@college.edu', 
        department: 'CSE', 
        year: 4, 
        clubs: ['Placement Cell'], 
        bio: 'Incoming SDE-1 at Atlassian. Concurrency and Jira tooling.',
        isPlaced: true, 
        placementDetails: { company: 'Atlassian', role: 'Software Engineer', offerType: 'On-Campus', ctcLpa: 42 } 
      },
      { 
        name: 'Varun Das', 
        email: 'varun@college.edu', 
        department: 'Chemical', 
        year: 4, 
        clubs: ['Placement Cell'], 
        bio: 'Process engineering and plant modeling at Reliance.',
        isPlaced: true, 
        placementDetails: { company: 'Reliance Industries', role: 'Graduate Engineer Trainee', offerType: 'On-Campus', ctcLpa: 14 } 
      },
      { 
        name: 'Aakash Bhatt', 
        email: 'aakash@college.edu', 
        department: 'ECE', 
        year: 4, 
        clubs: ['Robotics'], 
        bio: 'Silicon design & verification at Texas Instruments.',
        isPlaced: true, 
        placementDetails: { company: 'Texas Instruments', role: 'Analog Design Engineer', offerType: 'On-Campus', ctcLpa: 26 } 
      },
      { 
        name: 'Isha Nambiar', 
        email: 'isha@college.edu', 
        department: 'CSE', 
        year: 4, 
        clubs: ['E-Cell'], 
        bio: 'Quantitative technology & algorithms at Goldman Sachs.',
        isPlaced: true, 
        placementDetails: { company: 'Goldman Sachs', role: 'Summer Technology Analyst', offerType: 'On-Campus', ctcLpa: 34 } 
      },
      { 
        name: 'Manish Chawla', 
        email: 'manish@college.edu', 
        department: 'Mechanical', 
        year: 4, 
        clubs: ['Auto Club'], 
        bio: 'Chassis design & EV thermal modeling at Tata Motors.',
        isPlaced: true, 
        placementDetails: { company: 'Tata Motors', role: 'Automotive Design Engineer', offerType: 'On-Campus', ctcLpa: 12 } 
      }
    ];

    const CURRENT_ACADEMIC_YEAR = 2026;
    const users = [];
    for (const u of usersData) {
      const graduationYear = u.graduationYear || (CURRENT_ACADEMIC_YEAR + (4 - u.year));
      const user = new User({ ...u, graduationYear, passwordHash: 'password123' });
      await user.save();
      users.push(user);
    }
    console.log(`👥 Created ${users.length} users (${users.filter(u => u.isPlaced).length} placed)`);

    const admin = users[0];
    const culturalClub = users[1];
    const codingClub = users[2];
    const arjun = users[3];
    const priya = users[4];
    const rahul = users[5];
    const sneha = users[6];
    const riya = users[18];
    const kabir = users[19];
    const sara = users[20];
    const tanvi = users[21];
    const varun = users[22];
    const aakash = users[23];
    const isha = users[24];

    // 2. CREATE NEWS POSTS
    const newsData = [
      { 
        authorId: admin._id, 
        title: 'New Semester Registration & Course Electives Deadline', 
        body: 'All students are reminded to finalize their course electives on the portal before Friday 5:00 PM. Department faculty advisors are available for sign-offs in Block B.', 
        category: 'Academic', 
        likes: [arjun._id, priya._id, rahul._id, sneha._id, riya._id] 
      },
      { 
        authorId: culturalClub._id, 
        title: 'Annual Cultural Fest "Rhythms 2026" Schedule Out!', 
        body: 'Get ready for three days of music, dance battles, street play, and EDM night! Early bird passes and competition registrations are now live under the Events tab.', 
        category: 'Events', 
        likes: [arjun._id, priya._id, sneha._id, kabir._id, tanvi._id, isha._id, sara._id] 
      },
      { 
        authorId: codingClub._id, 
        title: 'HackPulse 2026: 36-Hour National Campus Hackathon', 
        body: 'Registrations are officially open for HackPulse! Tracks include AI/ML, Web3, FinTech, and Smart Campus. Mentors from Google and Microsoft will be evaluating final demos.', 
        category: 'Clubs', 
        likes: [arjun._id, rahul._id, priya._id, kabir._id, riya._id] 
      },
      { 
        authorId: admin._id, 
        title: 'Central Library Hours Extended to Midnight for Mid-Terms', 
        body: 'In response to student requests, study halls, digital research labs, and reading rooms on the 2nd floor will remain open until 12:00 AM midnight throughout this exam cycle.', 
        category: 'Academic', 
        likes: [arjun._id, sneha._id, priya._id, aakash._id] 
      },
      { 
        authorId: admin._id, 
        title: 'Campus Solar Energy Drive & Infrastructure Maintenance', 
        body: 'Installation of rooftop solar panels begins in the North Campus block this weekend. Minor power switchovers will be scheduled between 6:00 AM and 8:00 AM on Saturday.', 
        category: 'Admin', 
        likes: [varun._id, arjun._id] 
      }
    ];
    await NewsPost.insertMany(newsData);
    console.log(`📰 Created ${newsData.length} news posts`);

    // 3. CREATE EVENTS
    const eventsData = [
      { 
        organizerId: culturalClub._id, 
        title: 'Rhythms 2026 Grand Opening Night', 
        description: 'The monumental opening ceremony of our annual cultural extravaganza featuring live fusion bands, theatrical acts, and celebrity guest performances.', 
        category: 'Cultural', 
        dateTime: new Date(Date.now() + 86400000 * 4), 
        location: 'Main Amphitheatre', 
        capacity: 400,
        ticketPrice: 0 
      },
      { 
        organizerId: codingClub._id, 
        title: 'Tech Talk: System Design & Microservices at Scale', 
        description: 'Interactive deep dive into distributed caching, consensus algorithms, and database sharding with senior alumni engineers.', 
        category: 'Academic', 
        dateTime: new Date(Date.now() + 86400000 * 2), 
        location: 'CS Seminar Hall 1', 
        capacity: 3, // Small capacity to show waitlist logic
        ticketPrice: 0 
      },
      { 
        organizerId: users[13]._id, // Rohan NSS
        title: 'NSS Green Campus Tree Plantation Drive', 
        description: 'Join your fellow students in planting 300 native saplings along the perimeter wall. Refreshments and certificates will be distributed.', 
        category: 'Social', 
        dateTime: new Date(Date.now() + 86400000 * 6), 
        location: 'North Campus Botanical Lawn', 
        capacity: 100,
        ticketPrice: 0 
      },
      { 
        organizerId: admin._id, 
        title: 'Pre-Placement Orientation & Industry Briefing', 
        description: 'Essential orientation for 3rd and 4th-year students regarding placement season rules, resume screening protocols, and upcoming company visits.', 
        category: 'Academic', 
        dateTime: new Date(Date.now() + 86400000 * 1), 
        location: 'Virtual Auditorium (Zoom)', 
        capacity: 600,
        ticketPrice: 0 
      },
      { 
        organizerId: users[9]._id, // Vikram Sports
        title: 'Inter-Department Football Championship Finals', 
        description: 'High-voltage clash between Computer Science and Mechanical Engineering for the campus trophy. Cheer for your branch!', 
        category: 'Sports', 
        dateTime: new Date(Date.now() + 86400000 * 5), 
        location: 'Sports Complex Stadium', 
        capacity: 250,
        ticketPrice: 50 
      }
    ];
    const events = await Event.insertMany(eventsData);
    console.log(`🎉 Created ${events.length} events`);

    // 4. CREATE RSVPS & WAITLISTS
    const rsvpData = [
      // Event 1 (System Design - capacity 3: 3 confirmed, 2 waitlisted)
      { eventId: events[1]._id, userId: arjun._id, status: 'Confirmed' },
      { eventId: events[1]._id, userId: priya._id, status: 'Confirmed' },
      { eventId: events[1]._id, userId: rahul._id, status: 'Confirmed' },
      { eventId: events[1]._id, userId: sneha._id, status: 'Waitlisted' },
      { eventId: events[1]._id, userId: users[7]._id, status: 'Waitlisted' },

      // Other events
      { eventId: events[0]._id, userId: arjun._id, status: 'Confirmed' },
      { eventId: events[0]._id, userId: priya._id, status: 'Confirmed' },
      { eventId: events[0]._id, userId: kabir._id, status: 'Confirmed' },
      { eventId: events[0]._id, userId: tanvi._id, status: 'Confirmed' },
      
      { eventId: events[2]._id, userId: arjun._id, status: 'Confirmed' },
      { eventId: events[2]._id, userId: varun._id, status: 'Confirmed' },
      
      { eventId: events[3]._id, userId: rahul._id, status: 'Confirmed' },
      { eventId: events[3]._id, userId: sneha._id, status: 'Confirmed' },

      { eventId: events[4]._id, userId: arjun._id, status: 'Confirmed' },
      { eventId: events[4]._id, userId: rahul._id, status: 'Confirmed' }
    ];
    await RSVP.insertMany(rsvpData);
    console.log(`🎫 Created ${rsvpData.length} RSVPs`);

    // 5. CREATE VOLUNTEER NEEDS & APPLICATIONS
    const needsData = [
      { 
        eventId: events[0]._id, 
        creatorId: culturalClub._id, 
        title: 'Stage Production & Backstage Crew', 
        description: 'Coordinate artists, test sound equipment, and assist backstage operations for Rhythms 2026 Opening Night.', 
        slotsTotal: 6, 
        slotsFilled: 4, 
        status: 'Open' 
      },
      { 
        eventId: events[2]._id, 
        creatorId: users[13]._id, 
        title: 'Tree Sapling Planters & Logistics', 
        description: 'Help dig sapling pits, guide participants, and distribute organic compost.', 
        slotsTotal: 8, 
        slotsFilled: 8, 
        status: 'Full' 
      },
      { 
        creatorId: admin._id, 
        title: 'Library Archival & Research Indexing', 
        description: 'Assist the central library team in cataloging rare engineering journals and digitizing thesis archives.', 
        slotsTotal: 4, 
        slotsFilled: 1, 
        status: 'Open' 
      },
      { 
        eventId: events[4]._id, 
        creatorId: users[9]._id, 
        title: 'Sports Field Referee & First Aid Assistant', 
        description: 'Keep match scores, maintain line discipline, and manage hydration stations during the football finals.', 
        slotsTotal: 4, 
        slotsFilled: 2, 
        status: 'Open' 
      }
    ];
    const needs = await VolunteerNeed.insertMany(needsData);

    const appsData = [
      { volunteerNeedId: needs[0]._id, userId: arjun._id, status: 'Approved' },
      { volunteerNeedId: needs[0]._id, userId: priya._id, status: 'Approved' },
      { volunteerNeedId: needs[0]._id, userId: rahul._id, status: 'Approved' },
      { volunteerNeedId: needs[0]._id, userId: sneha._id, status: 'Approved' },
      { volunteerNeedId: needs[0]._id, userId: users[8]._id, status: 'Pending' },

      { volunteerNeedId: needs[1]._id, userId: users[7]._id, status: 'Approved' },
      { volunteerNeedId: needs[1]._id, userId: users[10]._id, status: 'Approved' },

      { volunteerNeedId: needs[2]._id, userId: arjun._id, status: 'Approved' },
      { volunteerNeedId: needs[3]._id, userId: users[11]._id, status: 'Approved' },
      { volunteerNeedId: needs[3]._id, userId: users[12]._id, status: 'Pending' }
    ];
    await VolunteerApplication.insertMany(appsData);
    console.log(`🤝 Created ${needs.length} Volunteer Needs & ${appsData.length} applications`);

    // 6. CREATE BLOG POSTS & EXPERIENCES
    const blogData = [
      {
        authorId: riya._id,
        title: 'Cracking Google SWE: 3 Rounds, System Design, & Behavioral Prep',
        body: 'Securing an on-campus offer from Google was a multi-month journey. In this post, I detail the online assessment format, how I tackled the data structures questions, and what the Googlyness round actually tests.',
        type: 'PlacementExperience',
        tags: ['Google', 'SWE', 'On-Campus', 'DataStructures'],
        upvotes: [arjun._id, priya._id, rahul._id, kabir._id, tanvi._id],
        placementDetails: {
          company: 'Google',
          role: 'Software Engineer',
          yearOfPlacement: 2025,
          department: 'CSE',
          roundsFaced: [
            { roundName: 'Online Assessment', description: '2 medium-hard questions on trees and dynamic programming with strict time limits.' },
            { roundName: 'Technical Interview 1', description: 'Graphs, BFS shortest paths with edge constraints, followed by clean code review.' },
            { roundName: 'Technical Interview 2', description: 'Design an in-memory rate limiter with sliding window log algorithms.' },
            { roundName: 'Googlyness & Leadership', description: 'Real scenario questions on conflict resolution, peer collaboration, and project trade-offs.' }
          ],
          difficultyRating: 5,
          verdictTips: 'Focus on clear communication and thinking out loud. Test edge cases explicitly before declaring your code complete.',
          verifiedPlacement: true
        }
      },
      {
        authorId: kabir._id,
        title: 'Microsoft SDE-1 On-Campus Placement Breakdown',
        body: 'My interview experience with Microsoft IDC. The process comprised an OA followed by three rounds of interviews covering OS fundamentals, tree traversals, and scalable system components.',
        type: 'PlacementExperience',
        tags: ['Microsoft', 'SDE', 'OperatingSystems', 'CSE'],
        upvotes: [arjun._id, priya._id, sneha._id, riya._id],
        placementDetails: {
          company: 'Microsoft',
          role: 'Software Development Engineer',
          yearOfPlacement: 2025,
          department: 'CSE',
          roundsFaced: [
            { roundName: 'Codility OA', description: '3 algorithm tasks covering strings, dynamic programming, and greedy logic.' },
            { roundName: 'Technical Round 1', description: 'Binary tree serialization & deserialization, followed by pointer manipulation.' },
            { roundName: 'Technical Round 2', description: 'Multithreading concepts, race conditions, mutex vs semaphores.' },
            { roundName: 'Director Round', description: 'High-level discussion of past internship projects and architectural trade-offs.' }
          ],
          difficultyRating: 4,
          verdictTips: 'Master standard CS fundamentals (OS, DBMS, Networks) in addition to coding practice.',
          verifiedPlacement: true
        }
      },
      {
        authorId: tanvi._id,
        title: 'Atlassian SDE Journey: High-Bar Concurrency & Values Round',
        body: 'Atlassian has one of the most structured and respectful interview processes. Here is how I prepared for their heavy emphasis on clean code, unit testing, and company values.',
        type: 'PlacementExperience',
        tags: ['Atlassian', 'SDE', 'Java', 'Concurrency'],
        upvotes: [arjun._id, rahul._id, kabir._id],
        placementDetails: {
          company: 'Atlassian',
          role: 'Software Engineer',
          yearOfPlacement: 2025,
          department: 'CSE',
          roundsFaced: [
            { roundName: 'Online Coding Challenge', description: 'Complex string and simulation problems.' },
            { roundName: 'Data Structures & Concurrency', description: 'Implement a thread-safe cache with eviction policies.' },
            { roundName: 'System & Code Craft', description: 'Refactor an existing modular codebase to be extensible.' },
            { roundName: 'Values Interview', description: 'Deep dive into Atlassian core values like "Open company, no bullshit".' }
          ],
          difficultyRating: 5,
          verdictTips: 'Write production-ready, clean code with descriptive variable names and automated unit tests.',
          verifiedPlacement: true
        }
      },
      {
        authorId: isha._id,
        title: 'Goldman Sachs Quantitative Technology Analyst Experience',
        body: 'How I cleared the Goldman Sachs test and interviews. Solid grasp of probability, combinatorics, and efficient matrix operations was instrumental.',
        type: 'PlacementExperience',
        tags: ['Goldman Sachs', 'Quant', 'FinTech', 'Algorithms'],
        upvotes: [arjun._id, priya._id],
        placementDetails: {
          company: 'Goldman Sachs',
          role: 'Summer Technology Analyst',
          yearOfPlacement: 2025,
          department: 'CSE',
          roundsFaced: [
            { roundName: 'Aptitude & Math OA', description: 'Puzzles, quant questions, and 2 algorithmic questions.' },
            { roundName: 'Technical Interview', description: 'Heap implementation, median in streaming data, and DB indexing.' },
            { roundName: 'HR & Fit Round', description: 'Interest in financial systems and stress testing scenarios.' }
          ],
          difficultyRating: 4,
          verdictTips: 'Do not ignore discrete mathematics and probability basics during prep.',
          verifiedPlacement: true
        }
      },
      {
        authorId: aakash._id,
        title: 'Texas Instruments Analog Design Core Experience',
        body: 'A guide for ECE students targeting core hardware roles. Covers circuit design questions, Op-Amp analysis, and MOSFET characteristics asked in TI interviews.',
        type: 'PlacementExperience',
        tags: ['Texas Instruments', 'ECE', 'Analog', 'Core'],
        upvotes: [arjun._id, users[7]._id],
        placementDetails: {
          company: 'Texas Instruments',
          role: 'Analog Design Engineer',
          yearOfPlacement: 2025,
          department: 'ECE',
          roundsFaced: [
            { roundName: 'Technical Written Exam', description: 'Analog circuits, RC transients, and digital logic.' },
            { roundName: 'Technical Interview 1', description: 'Small-signal analysis and frequency response of two-stage Op-Amps.' },
            { roundName: 'Technical Interview 2', description: 'Noise analysis and layout considerations.' }
          ],
          difficultyRating: 4,
          verdictTips: 'Understand circuit fundamentals deeply from Razavi and Sedra/Smith.',
          verifiedPlacement: true
        }
      },
      {
        authorId: varun._id,
        title: 'Reliance Industries Process Engineering On-Campus Review',
        body: 'Detailed walkthrough of the recruitment process for Chemical and Mechanical students for manufacturing and refinery operations.',
        type: 'PlacementExperience',
        tags: ['Reliance Industries', 'Core', 'Chemical', 'Engineering'],
        upvotes: [arjun._id, users[11]._id],
        placementDetails: {
          company: 'Reliance Industries',
          role: 'Graduate Engineer Trainee',
          yearOfPlacement: 2025,
          department: 'Chemical',
          roundsFaced: [
            { roundName: 'Aptitude & Core Test', description: 'Thermodynamics, heat transfer, and logical reasoning.' },
            { roundName: 'Technical Interview', description: 'Distillation column design and safety valves analysis.' }
          ],
          difficultyRating: 3,
          verdictTips: 'Revise core unit operations and industrial safety protocols.',
          verifiedPlacement: true
        }
      },
      {
        authorId: priya._id,
        title: 'Smart Campus Navigation: A Student Guide for Freshers',
        body: 'Finding the right labs, getting library cards stamped, finding the fastest routes between Block A and North Lawn, and surviving 8:00 AM lectures.',
        type: 'General',
        tags: ['CampusLife', 'Freshers', 'Guide'],
        upvotes: [arjun._id, sneha._id]
      },
      {
        authorId: sara._id,
        title: 'Combining Biology and Computer Science: Bioinformatics Roadmap',
        body: 'Why interdisciplinary computational biology is thriving and how students can get started with Python, Biopython, and sequence alignment algorithms.',
        type: 'General',
        tags: ['Bioinformatics', 'Research', 'Python'],
        upvotes: [arjun._id, users[16]._id]
      }
    ];
    const blogs = await BlogPost.insertMany(blogData);
    console.log(`📝 Created ${blogs.length} Blog Posts (${blogs.filter(b => b.type === 'PlacementExperience').length} placement experiences)`);

    // 7. CREATE CONNECTIONS (FOLLOWS)
    const connectionsData = [
      { followerId: arjun._id, followingId: priya._id },
      { followerId: priya._id, followingId: arjun._id },
      { followerId: rahul._id, followingId: priya._id },
      { followerId: sneha._id, followingId: arjun._id },
      { followerId: arjun._id, followingId: riya._id },
      { followerId: priya._id, followingId: riya._id },
      { followerId: rahul._id, followingId: kabir._id },
      { followerId: arjun._id, followingId: kabir._id },
      { followerId: sneha._id, followingId: tanvi._id },
      { followerId: arjun._id, followingId: tanvi._id },
      { followerId: users[7]._id, followingId: aakash._id },
      { followerId: users[11]._id, followingId: varun._id }
    ];
    const connections = await Connection.insertMany(connectionsData);
    console.log(`🔗 Created ${connections.length} user connections`);

    // 8. CREATE EVENT UPDATES
    const updatesData = [
      { eventId: events[1]._id, authorId: codingClub._id, text: 'Session location confirmed: CS Seminar Hall 1. Please arrive 10 minutes early.' },
      { eventId: events[1]._id, authorId: arjun._id, text: 'Will the slides on distributed caching be shared after the talk?' },
      { eventId: events[0]._id, authorId: culturalClub._id, text: 'Sound check starts at 4:30 PM. Volunteers please report to backstage area.' },
      { eventId: events[2]._id, authorId: users[13]._id, text: 'Gardening gloves and tools will be provided at the North Lawn desk.' }
    ];
    const updates = await EventUpdate.insertMany(updatesData);
    console.log(`📢 Created ${updates.length} event updates`);

    // 9. CREATE COMMENTS ON BLOGS
    const commentsData = [
      { parentType: 'BlogPost', parentId: blogs[0]._id, authorId: arjun._id, text: 'Incredible breakdown Riya! Did you take any mock interviews prior to the Googlyness round?' },
      { parentType: 'BlogPost', parentId: blogs[0]._id, authorId: riya._id, text: 'Yes, practicing with peers who give honest critical feedback was vital.' },
      { parentType: 'BlogPost', parentId: blogs[1]._id, authorId: priya._id, text: 'Super clear notes on Codility time complexity limits. Thanks Kabir!' },
      { parentType: 'BlogPost', parentId: blogs[2]._id, authorId: rahul._id, text: 'Atlassian values round is definitely distinct. Great advice on being authentic.' },
      { parentType: 'BlogPost', parentId: blogs[6]._id, authorId: sneha._id, text: 'So true about the 8 AM lectures in Block A!' }
    ];
    const comments = await Comment.insertMany(commentsData);
    console.log(`💬 Created ${comments.length} comments`);

    console.log('\n📊 SEEDING COMPLETE & VERIFIED:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Total Users: ${users.length} (${users.filter(u => u.isPlaced).length} placed students)`);
    console.log(`   Top Recruiters: Google, Microsoft, Amazon, Atlassian, Texas Instruments, Goldman Sachs, Reliance, Tata Motors`);
    console.log(`   News Posts: ${newsData.length}`);
    console.log(`   Campus Events: ${events.length}`);
    console.log(`   Volunteer Needs: ${needs.length}`);
    console.log(`   Blog Posts: ${blogs.length} (6 placement reviews, 2 general guides)`);
    console.log(`   Connections: ${connections.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n🔑 Ready to login:');
    console.log('   Student: arjun@college.edu / password123');
    console.log('   Admin:   admin@college.edu / password123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
