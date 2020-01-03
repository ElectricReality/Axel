var Service = function() {

};

Service.prototype.Create = function() {
  console.log("Service Create")
  console.log(this.options)
}

Service.prototype.Update = function() {
  console.log("Service Updated")
  console.log(this.options)
}
