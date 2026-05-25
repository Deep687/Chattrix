type Product = {
  name: string;
  price: number;
  inStock: boolean;
  category: string;
};

const products: Product[] = [
  { name: "Laptop",  price: 999, inStock: true,  category: "electronics" },
  { name: "Phone",   price: 599, inStock: true,  category: "electronics" },
  { name: "Book",    price: 19,  inStock: false, category: "education" },
  { name: "Course",  price: 49,  inStock: true,  category: "education" },
  { name: "Monitor", price: 349, inStock: false, category: "electronics" },
];


// 1. Get all in-stock products

const getInstockProduct:Product[] = [];
let newIndex=0;
for(let index=0; index < products.length; index++){
  if(products[index].inStock){
    getInstockProduct[newIndex]=products[index];
    newIndex++;
  }
}
console.log(getInstockProduct);


// 2. Get names of all products

const getNamesOfAllProducts:string[] = [];

for(let i=0; i < products.length; i++){
  getNamesOfAllProducts[i] = products[i].name;
}
console.log(getNamesOfAllProducts);

// 3. Calculate total price of all products

let calculateTotalCost:number = 0;

for(let i=0; i < products.length; i++){
  calculateTotalCost += products[i].price;
}

console.log(calculateTotalCost);


// 4. Get names of in-stock products

const namesOFInstockProducts:string[]= [];

for ( let i=0; i < products.length; i++){
  if(products[i].inStock){
  namesOFInstockProducts[i]=products[i].name;
  }
}

console.log(namesOFInstockProducts);



// 5. Find the most expensive product

let mostExpensiveProduct: Product = products[0];

for(let i= 0; i<products.length; i++){
  if(mostExpensiveProduct.price < products[i].price)
  {
    mostExpensiveProduct = products[i];
  }
}

console.log(mostExpensiveProduct);


// 6. Count how many products belong to each category






// 7. Check if at least one product is out of stock


// 8. Check if all products are in stock


// 9. Sort products by price (low → high)


// 10. Total value of only in-stock electronics products