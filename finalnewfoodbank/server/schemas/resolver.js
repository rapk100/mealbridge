const { AuthenticationError } = require('apollo-server-express'); 
const { User, Category, Product } = require('../models'); 
const { signToken } = require('../utils/auth'); 

const resolvers = {
    Query: {
        //this resolver returns the user own profile if they are logged, if not the rror is thrown
        me: async (parent, arg, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id}); 
            }
            throw new AuthenticationError('You need to be logged in!'); 
        },
        categories: async () => {
            return Category.find().populate('products'); 
        },
        category: async (parent, {categoryId}) => {
            return Category.findOne({_id: categoryId}).populate('products')
        },
        products: async () => {
            return Product.find(); 
        },
        product: async (parent, { productId }) => {
            return Product.findOne({ _id: productId });
          }
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password }); 
            const token = signToken(user); 

            return { token, user }; 
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email }); 

            const correctPW = (await user.isCorrectPassword(password))?true:false;

            if (!user || !correctPW ) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user); 
            return { token, user }; 
        },
        addCategory: async (parent, { name }) => {
            const category = await Category.create({ name }); 
            return category; 
        },
        addProduct: async (parent, { name, description, image, quantity, categoryId }) => {
            let category = null;
            
            if (categoryId) {
              category = await Category.findById(categoryId);
              
              if (!category) {
                throw new Error(`Category not found for ID: ${categoryId}`);
              }
            }
          
            const product = await Product.create({
              name,
              description,
              image,
              quantity,
              category: categoryId,
            });
          
            if (category) {
              category.products.push(product._id);
              await category.save();
            }
          
            return product;
          },
          updateProduct: async (parent, { id, quantity, name, description }) => {
            const updatedProduct = await Product.findByIdAndUpdate(id, {
              quantity,
              name,
              description
            }, { new: true });
        
            return updatedProduct;
          },
          
        deleteProduct: async (parent, { id }) => {
            return await Product.findOneAndDelete({ _id: id } )
        },
    },
}; 

module.exports = resolvers; 


