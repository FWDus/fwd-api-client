class FWD.Article extends FWD.Model
  @press: (filterParams = {})=>
    (new FWD.PressLoader).load(filterParams)