const fs = require('fs');
const path = require('path');

const filePath = "d:\\Websites\\Flipzokart\\backend\\controllers\\orderController.js";
let content = fs.readFileSync(filePath, 'utf8');

// The update logic: Replace relatedId with orderId AND add the admin notification
// We'll look for the specific block.
// We use a regex to match the structure and capture the user notification.
const searchStr = /await Notification\.create\(\{[\s\S]*?recipient: order\.user,[\s\S]*?message: `Your order #\$\{order\._id\.toString\(\)\.slice\(-6\)\} has been placed successfully!`[\s\S]*?type: 'newOrder',[\s\S]*?relatedId: order\._id[\s\S]*?\}\);/g;

const replacement = `await Notification.create({
      recipient: order.user,
      message: \`Your order #\${order._id.toString().slice(-6)} has been placed successfully!\`,
      type: 'newOrder',
      orderId: order._id
    });

    // 🔒 ULTRA LOCK: Create Persistent Admin Notification
    await Notification.create({
      type: 'adminNewOrder',
      message: \`New order received from \${req.user.name || 'Guest'}\`,
      orderId: order._id
    });`;

let count = 0;
const newContent = content.replace(searchStr, (match) => {
    count++;
    return replacement;
});

if (count > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Success: Replaced ${count} occurrences.`);
} else {
    console.log("Error: Could not find the target code segments.");
}
