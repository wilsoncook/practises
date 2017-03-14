// Normal Way
// function matrixFind(matrix, value) {
//   for (var i = 0, len = matrix.length; i < len; i++) {
//     var list = matrix[i];
//     if (value >= list[0] && value <= list[list.length - 1]) {
//       return binaryFind(list, value);
//     }
//   }
// }

function matrixFind(matrix, value) {
  var list, i = 0;
  while (list = matrix[i++]) {
    if (value >= list[0] && value <= list[list.length - 1]) {
      return binaryFind(list, value);
    }
  }
  return false;
}

function binaryFind(list, value) {
  var low = 0, high = list.length - 1, mid;
  while(low <= high) {
    mid = Math.ceil((low + high) / 2);
    if (value < list[mid]) {
      high = mid - 1;
    } else if (value > list[mid]) {
      low = mid + 1;
    } else {
      // return mid;
      return true;
    }
  }
  return false;
}

// TESTING

var matrix = [
  [2,   4,  8,  9],
  [10, 13, 15, 21],
  [23, 31, 33, 51]
];

console.log('result: ', 
  matrixFind(matrix, 4), matrixFind(matrix, 24), matrixFind(matrix, 33), matrixFind(matrix, 51));


// 写在最后: 算法可根据实际情况采用 插值方式或其他方式，目前由于时间关系暂未实现额外的方式，也未能对比不同方式的实际performance，还请海涵