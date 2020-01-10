// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - todo
/* jshint asi: true */

(function() {"use strict"})()

var Lock_
var LockWait_
var Properties_
var PropertyName_

// Table.gs
// ========
//
// A lockup table kept in persistant storage, where each entry is an object 
// describes a row in a table and has a unique identifier.

/**
 * Initialise the Table library
 *
 * @param {Lock} lock
 */
 
function initialise(lock, lockWait, properties, propertyName) {

  Log.functionEntryPoint()
  Lock_ = lock
  LockWait_ = lockWait
  Properties_ = properties
  PropertyName_ = propertyName

} // initialise() 

/**
 * We are reading in the table, making changes and then writing them
 * back to properties, so stop any other changes being made to the
 * table whilst we are working on it
 */
 
function lock() {

  Log.functionEntryPoint()
  Lock_.waitLock(LockWait_)
  Log.fine('Locked lookup table')
  
} // Table.lock() 

/**
 * Release the lookup table for other instances of the script
 */
 
function release() {

  Log.functionEntryPoint()
  
  if (Lock_.hasLock()) {
    Log.fine('Releasing lookup table')
  }

  Lock_.releaseLock()

} // Table.lock() 

/**
 * Get Lookup Table. If it is going to be written back to 
 * it needs to be locked while we are working on it.
 *
 * @return {Object} lookup table (maybe empty)
 */
 
function get() {

  Log.functionEntryPoint()
    
  var tableString = Properties_.getProperty(PropertyName_)
  
  Log.fine('getTable: ' + tableString)
  
  if (tableString === null) {
    Log.fine('The lookup table is empty')
    return {}
  }

  return JSON.parse(tableString)
  
} // Table.get() 

/**
 * Upate the EM Lookup Table. 
 *
 * @param {Object} table
 *
 * @return {Object}
 */
 
function set(table) {

  Log.functionEntryPoint()
  
  if (!Lock_.hasLock()) {
    throw new Error('Trying to update lookup table without first locking it')
  }

  var tableString = JSON.stringify(table)
  
  Properties_
    .setProperty(
      PropertyName_, 
      tableString) 

  Log.fine('setTable: ' + tableString)
    
} // Table.set() 

/**
 * Store a new entry in a particular row of the lookup table
 *
 * @param {String} rowId
 * @param {String} columnId
 * @param {String} value
 */
  
function setValue(rowId, columnId, value) {
  
  Log.functionEntryPoint()

  Log.finer('rowId: ' + rowId)
  Log.finer('columnId: ' + columnId)
  Log.finer('value: ' + value)

  lock()

  var lookupTable = get()
  
  if (!lookupTable.hasOwnProperty(rowId)) {
  
    lookupTable[rowId] = {} 
    Log.fine('Initialised lookup table entry for "' +  rowId + '"')    
  }
  
  lookupTable[rowId][columnId] = value
  set(lookupTable)
  
  release()
  
} // Table.setValue() 

/**
 * Get a specific value in a particular row of the lookup table
 *
 * @param {String} rowId
 * @param {String} columnId
 *
 * @return {String} value or null
 */
  
function getValue(rowId, columnId) {
  
  Log.functionEntryPoint()

  Log.fine('rowId: ' + rowId)
  Log.fine('columnId: ' + columnId)

  var lookupTable = get()
  var value = null
  
  if (lookupTable.hasOwnProperty(rowId)) {
  
    value = lookupTable[rowId][columnId]
    Log.fine('Got value "' + value + '" from row: "' + rowId + '", column: "' + columnId + '"')
  }
  
  return value

} // Table.getValue() 

/**
 * Delete a row from the lookup table
 *
 * @param {String} rowId
 */
 
function deleteRow(rowId) {

  Log.functionEntryPoint()

  lock()

  var lookupTable = get()
  
  if (!lookupTable.hasOwnProperty(rowId)) {
  
    Log.warning('There is no row: "' + rowId + '"')
      
  } else {
  
    delete lookupTable[rowId]
    Log.info('Deleted lookup table row: "' + rowId + '"')
  }
  
  set(lookupTable)
  
  release()
  
} // Table.deleteRow() 