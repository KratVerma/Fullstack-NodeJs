const Product = require('../models/product');

const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');


exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: 'Attached file is not an Image!',
            validationErrors: [],
        });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    const imageUrl = image.path;


    const product = new Product({
        // _id: new mongoose.Types.ObjectId('60c084c95d39131c2c32ceac'),
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/admin-product-list');
        })
        .catch(err => {
            const error = new Error('Creating a Product failed');
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return req.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch(err => {
            const error = new Error('Creating a Product failed');
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDes = req.body.description;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDes,
                _id: prodId,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDes;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            return product.save()
                .then(result => {
                    console.log('UPDATED PRODUCT!!');
                    res.redirect('/admin/admin-product-list');
                });
        })
        .catch(err => {
            const error = new Error('Creating a Product failed');
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getProductList = (req, res, next) => {
    Product
        .find({ userId: req.user._id })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(prods => {
            console.log(prods);
            res.render('admin/admin-product-list', {
                prds: prods,
                pageTitle: 'Admin Products',
                path: '/admin/admin-product-list'
            });
        })
        .catch(err => {
            const error = new Error('Creating a Product failed');
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(prd => {
            if (!prd) {
                return next(new Error('Product not Found!'));
            }
            fileHelper.deleteFile(prd.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(result => {
            console.log('DESTROYED PRODUCT!!');
            res.status(200).json({ message: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting Product failed.' });
        });
};