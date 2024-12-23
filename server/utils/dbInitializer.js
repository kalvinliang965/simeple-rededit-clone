// server/utils/dbInitializer.js

const communityUtils = require("./communityUtils.js");
const postUtils = require("./postUtils.js");
const commentUtils = require("./commentUtils.js");
const linkFlairUtils = require("./linkFlairUtils.js");
const userUtils = require("./userUtils.js");


async function initializeDB(adminCredentials) {

    console.log("InitializeDB");

    // link flair objects
    const linkFlair1 = { // link flair 1
        linkFlairID: 'lf1',
        content: 'The jerkstore called...', 
    };
    const linkFlair2 = { //link flair 2
        linkFlairID: 'lf2',
        content: 'Literal Saint',
    };
    const linkFlair3 = { //link flair 3
        linkFlairID: 'lf3',
        content: 'They walk among us',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'Worse than Hitler',
    };

    let linkFlairRef1 = await linkFlairUtils.createLinkFlair(linkFlair1);
    let linkFlairRef2 = await linkFlairUtils.createLinkFlair(linkFlair2);
    let linkFlairRef3 = await linkFlairUtils.createLinkFlair(linkFlair3);
    let linkFlairRef4 = await linkFlairUtils.createLinkFlair(linkFlair4);
    

    // comment objects

    const comment8 = {
        content: `admin's comment`,
        commentIDs: [],
        commentedBy: adminCredentials.displayName,
        commentedDate: new Date('September 10, 2024 09:43:00'),
    }
    const commentRef8 = await commentUtils.createComment(comment8);

    const comment7 = { // comment 7
        commentID: 'comment7',
        content: 'Generic poster slogan #42',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 10, 2024 09:43:00'),
    };
    let commentRef7 = await commentUtils.createComment(comment7);

    const comment6 = { // comment 6
        commentID: 'comment6',
        content: 'I want to believe.',
        commentIDs: [commentRef7],
        commentedBy: 'outtheretruth47',
        commentedDate: new Date('September 10, 2024 07:18:00'),
    };
    let commentRef6 = await commentUtils.createComment(comment6);
    
    const comment5 = { // comment 5
        commentID: 'comment5',
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 09, 2024 017:03:00'),
    }
    let commentRef5 = await commentUtils.createComment(comment5);
    
    const comment4 = { // comment 4
        commentID: 'comment4',
        content: 'The truth is out there.',
        commentIDs: [commentRef6],
        commentedBy: "astyanax",
        commentedDate: new Date('September 10, 2024 6:41:00'),
    };
    let commentRef4 = await commentUtils.createComment(comment4);
    
    const comment3 = { // comment 3
        commentID: 'comment3',
        content: 'My brother in Christ, are you ok? Also, YTJ.',
        commentIDs: [],
        commentedBy: 'rollo',
        commentedDate: new Date('August 23, 2024 09:31:00'),
    };

    let commentRef3 = await commentUtils.createComment(comment3);
    
    const comment2 = { // comment 2
        commentID: 'comment2',
        content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.',
        commentIDs: [],
        commentedBy: 'astyanax',
        commentedDate: new Date('August 23, 2024 10:57:00'),
    };
    let commentRef2 = await commentUtils.createComment(comment2);
    
    const comment1 = { // comment 1
        commentID: 'comment1',
        content: 'There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.',
        commentIDs: [commentRef3],
        commentedBy: 'shemp',
        commentedDate: new Date('August 23, 2024 08:22:00'),
    };
    let commentRef1 = await commentUtils.createComment(comment1);


    // post objects
    const post1 = { // post 1
        postID: 'p1',
        title: 'AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.',
        content: 'Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?',
        linkFlairID: linkFlairRef1,
        postedBy: 'trucknutz69',
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef1, commentRef2],
        views: 14,
    };
    const post2 = { // post 2
        postID: 'p2',
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: 'MarcoArelius',
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [commentRef4, commentRef5],
        views: 1023,
    };

    const post3 = { // post 3
        title: "Welcome to Jacky chen's fan page!",
        content: 'Everyone like to watch Rush Hour! This Movie is amazing!',
        linkFlairID: linkFlairRef3,
        postedBy: adminCredentials.displayName,
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [commentRef8],
        views: 10,
    }
    let postRef1 = await postUtils.createPost(post1);
    let postRef2 = await postUtils.createPost(post2);
    let postRef3 = await postUtils.createPost(post3);

    // community objects
    const community1 = {// community object 1
        communityID: 'community1',
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: ['rollo', 'shemp', 'catlady13', 'astyanax', 'trucknutz69'],
        owner: 'trucknutz69',
        creator: 'trucknutz69',
    };
    const community2 = { // community object 2
        communityID: 'community2',
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: ['MarcoArelius', 'astyanax', 'outtheretruth47', 'bigfeet'],
        owner: "MarcoArelius",
        creator: "trucknutz69",
    };
    const community3 = {
        name: `Jacky Chen's fan page!`,
        description: 'This community is create for testing purpose',
        postIDs: [postRef3],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: [adminCredentials.displayName],
        owner: adminCredentials.displayName,
        creator: adminCredentials.displayName,
    }
    let communityRef1 = await communityUtils.createCommunity(community1);
    let communityRef2 = await communityUtils.createCommunity(community2);
    let communityRef3 = await communityUtils.createCommunity(community3); 

    // Users objects

    const admin = {
        displayName: adminCredentials.displayName,
        firstName: adminCredentials.firstName,
        lastName: adminCredentials.lastName,
        email: adminCredentials.email,
        password: adminCredentials.password,
        createdDate: adminCredentials.createdDate,
        // reputation, we will use default value for now
        admin: true,
        communities: [communityRef3],
        ownedCommunities: [communityRef3],
        comments: [commentRef8],
        posts: [postRef3],
    }
    let adminRef = await userUtils.createUser(admin);


    const user1 = {
        displayName: "rollo",
        firstName: "Michael",
        lastName: "Jordan",
        email: "rollo@gmail.com",
        password: "rollo123",
        createdDate: new Date('May 4, 2008 09:32:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef1],
        comments: [commentRef3,],
        posts: [],
    }
    let userRef1 = await userUtils.createUser(user1);


    const user2 = {
        displayName: "shemp",
        firstName: "Jason",
        lastName: "Mulk",
        email: "shemp@gmail.com",
        password: "I love rollo",
        createdDate: new Date('May 12, 2008 10:32:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef1],
        comments: [commentRef1],
        posts: [],
    }
    let userRef2 = await userUtils.createUser(user2);


    const user3 = {
        displayName: "catlady13",
        firstName: "Wei",
        lastName: "Wei",
        email: "catlady13@gmail.com",
        password: "I love Lebron",
        createdDate: new Date('September 8, 2003 9:32:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef1],
        comments: [],
        posts: [],
    }
    let userRef3 = await userUtils.createUser(user3);


    const user4 = {
        displayName: "astyanax",
        firstName: "XiaoMing",
        lastName: "Wang",
        email: "astyanax@gmail.com",
        password: "kobe look cute",
        createdDate: new Date('August 18, 2004 9:11:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef1, communityRef2],
        comments: [commentRef4, commentRef2],
        posts: [],
    }
    let userRef4 = await userUtils.createUser(user4);


    const user5 = {
        displayName: "trucknutz69",
        firstName: "Tiffany",
        lastName: "Chaos",
        email: "trucknutz69@gmail.com",
        password: "trucknutz6969696969",
        createdDate: new Date('March 18, 1998 7:11:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef1],
        ownedCommunities: [communityRef1],
        comments: [],
        posts: [postRef1, ],
    }
    let userRef5 = await userUtils.createUser(user5);


    const user6 = {
        displayName: "MarcoArelius",
        firstName: "GG",
        lastName: "Bone",
        email: "MarcoArelius@gmail.com",
        password: "MarcoArelius*(&)*(&()",
        createdDate: new Date('September 27, 2009 9:11:00'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef2],
        ownedCommunities: [communityRef2],
        comments: [],
        posts: [postRef2,],
    }
    let userRef6 = await userUtils.createUser(user6);


    const user7 = {
        displayName: "outtheretruth47",
        firstName: "Tim",
        lastName: "Robot",
        email: "outtheretruth474747@gmail.com",
        password: "outtheretruth47)(*20394",
        createdDate: new Date('December 2, 2000 10:31:22'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef2],
        comments: [commentRef6],
        posts: [],
    }
    let userRef7 = await userUtils.createUser(user7);


    const user8 = {
        displayName: "bigfeet",
        firstName: "XiaoFang",
        lastName: "Li",
        email: "bigfeet888@gmail.com",
        password: "bigfeetCSE#!^316",
        createdDate: new Date('December 2, 2000 10:31:20'),
        // reputation, we will use default value for now
        admin: false,
        communities: [communityRef2],
        comments: [commentRef5, commentRef7],
        posts: [],
    }
    let userRef8 = await userUtils.createUser(user8);

    console.log("done");
}

module.exports = initializeDB;