<style>

 tom: 20px;
       padding-top: 26px;
       transition: all .3s ease-in;
    }
    .header__container:hover {
        background-color: black;

    }
    .header__container  h1{
        font-weight: 700;
        font-size: 28px;
    }
    ul{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 45px;
        padding-top: 13px;
        color: white;
    }
   
    li{
        list-style: none;
    }
    a{
        text-decoration: none;
        color: rgb(255, 255, 255);
        font-size: 18px;
        font-weight: 700;
    }
    a:hover{
        text-decoration: underline;
    }
    .dropbtn {
      color: white;
      padding: 16px;
      border: none;
      cursor: pointer;
      background-color: transparent;
    }

    .dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-content {
      display: none;
      position: absolute;
      background-color: #f9f9f9;
      min-width: 100px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 1;
    }
    
    .dropdown-content a {
      color: rgba(0, 0, 0, 0.749);
      padding: 12px 16px;
      text-decoration: none;
      font-size: 15px;
      display: flex;
      align-items: center;
      column-gap: 5px;
    }
    
    .dropdown-content a:hover {background-color: #f1f1f1}
    
    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content {
      display: block;
    }
   
    
    
    .topTitle::before {
            content: "Free Shipping to India on orders above ₹8000";
            animation: animate infinite 16s;
            padding-left: 10px;
        }
  
        @keyframes animate {
  
            33% {
                content: "Extended Returns";
            }
  
            66% {
                content: "Black Friday Event: Men | Women";
            }
  
         
        }

      
</style>