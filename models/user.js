const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    resetToken: String,

    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                requried: true
            }
        }]
    },
});

userSchema.methods.addToCart = function (product) {

    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuant = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuant = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuant;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuant
        });

    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.delItemCart = function (prodId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prodId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.addOrder = function () {
    return this.getCart()
        .then(prdcts => {
            const order = {
                items: prdcts,
                user: {
                    _id: new ObjectID(this._id),
                    name: this.name
                }
            };
            return db.collection('orders')
                .insertOne(order);
        })
        .then(result => {
            this.cart = { items: [] };
            return db
                .collection('users')
                .updateOne(
                    { _id: new ObjectID(this._id) },
                    { $set: { cart: { items: [] } } }
                );
        });
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}


module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectID = mongodb.ObjectID;

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }
//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             });

//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuant = 1;
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuant = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuant;
//         } else {
//             updatedCartItems.push({
//                 productId: new ObjectID(product._id),
//                 quantity: newQuant
//             });

//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne(
//                 { _id: new ObjectID(this._id) },
//                 { $set: { cart: updatedCart } }
//             );
//     }

//     delItemCart(prodId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== prodId.toString();
//         });
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne(
//                 { _id: new ObjectID(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return {
//                         ...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     };
//                 });
//             })
//             .catch(err => console.log(err));
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(prdcts => {
//                 const order = {
//                     items: prdcts,
//                     user: {
//                         _id: new ObjectID(this._id),
//                         name: this.name
//                     }
//                 };
//                 return db.collection('orders')
//                     .insertOne(order);
//             })
//             .then(result => {
//                 this.cart = { items: [] };
//                 return db
//                     .collection('users')
//                     .updateOne(
//                         { _id: new ObjectID(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             });

//     }

//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({ 'user._id': new ObjectID(this._id) })
//             .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .find({ _id: new ObjectID(userId) })
//             .next()
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => console.log(err));
//     }
// }

// module.exports = User;